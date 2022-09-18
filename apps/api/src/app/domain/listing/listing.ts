import { EventProcessor, EventSourcedEntity } from "../../infrastructure/event-sourced-entity";
import { SourcedEvent } from "../../infrastructure/sourced-event";
import { getLogger } from "../../infrastructure/logging";
import { CreateListingCommand } from "../../commands/listing/create-listing-command";
import { ListingStatus } from "./listing-status";
import { ChainTransaction } from "../../commands/listing/chain-transaction";
import {
    ListingActivatedEvent,
    ListingCanceledEvent,
    ListingCreatedEvent,
    ListingSoldEvent,
    ListingSubmittedEvent,
    ListingUpdatedPriceEvent
} from "./listing-events";
import { BadRequestException } from "@nestjs/common";
import { EMPTY } from "rxjs";

export class Listing extends EventSourcedEntity {
    private price: number;
    private nftId?: string;
    private categoryId: string;
    private blockchainId: string;
    private tokenContractAddress?: string;
    private nftAddress?: string;
    private chainTokenId?: string;
    private userId: string;
    private status: ListingStatus;
    private chainTransaction: ChainTransaction;
    private chainListingId: number;
    private walletId: string;
    private animationUrl: string;
    private imageUrl: string;

    static fromEvents(id: string, events: Array<SourcedEvent>): Listing {
        const listing = new Listing(id);
        listing.processEvents(events);
        return listing;
    }

    static create(id: string, command: CreateListingCommand): Listing {
        const listing = new Listing(id);
        listing.price = command.price;
        listing.tokenContractAddress = command.tokenContractAddress;
        listing.nftAddress = command.nftAddress;
        listing.blockchainId = command.blockchainId;
        listing.nftId = command.nftId;
        listing.categoryId = command.categoryId;
        listing.userId = command.userId;
        listing.chainTokenId = command.chainTokenId;
        listing.status = ListingStatus.CREATED;
        listing.walletId = command.walletId;
        listing.animationUrl = command.animationUrl;
        listing.imageUrl = command.imageUrl;

        const event = new ListingCreatedEvent(
            listing.price,
            listing.userId,
            listing.categoryId,
            listing.blockchainId,
            listing.walletId,
            listing.imageUrl,
            listing.animationUrl,
            listing.tokenContractAddress,
            listing.nftAddress,
            listing.chainTokenId,
            listing.nftId
        );

        listing.apply(event);
        return listing;
    }

    private constructor(id: string) {
        super(id, getLogger(Listing));
    }

    submitToChain(chainTransactionId: string) {
        if (this.status !== ListingStatus.CREATED) {
            throw new BadRequestException(`Listing with id ${this.id} is not CREATED`);
        }

        this.chainTransaction = new ChainTransaction();
        this.chainTransaction.transactionId = chainTransactionId;
        this.status = ListingStatus.SUBMITTED;
        this.apply(new ListingSubmittedEvent(chainTransactionId));
        //todo run a listener for chain events here
    }

    activate(blockNumber: number, chainListingId: number) {
        if (this.status !== ListingStatus.SUBMITTED) {
            throw new BadRequestException(`Listing with id ${this.id} is not SUBMITTED`);
        }

        this.chainTransaction.blockNumber = blockNumber;
        this.chainListingId = chainListingId;
        this.status = ListingStatus.ACTIVE;
        this.apply(new ListingActivatedEvent(blockNumber, chainListingId));
    }

    @EventProcessor(ListingCreatedEvent)
    private processListingCreatedEvent = (event: ListingCreatedEvent) => {
        this.price = event.price;
        this.tokenContractAddress = event.tokenContractAddress;
        this.nftAddress = event.nftAddress;
        this.blockchainId = event.blockchainId;
        this.nftId = event.nftId;
        this.categoryId = event.categoryId;
        this.walletId = event.walletId;
        this.userId = event.userId;
        this.chainTokenId = event.chainTokenId;
        this.status = ListingStatus.CREATED;
        this.animationUrl = event.animationUrl;
        this.imageUrl = event.imageUrl;
    };

    @EventProcessor(ListingSubmittedEvent)
    private processListingSubmittedEvent = (event: ListingSubmittedEvent) => {
        this.chainTransaction = {
            transactionId: event.chainTransactionId
        };
        this.status = ListingStatus.SUBMITTED;
    };

    @EventProcessor(ListingActivatedEvent)
    private processListingActivatedEvent = (event: ListingActivatedEvent) => {
        this.chainTransaction.blockNumber = event.blockNumber;
        this.chainListingId = event.chainListingId;
        this.status = ListingStatus.ACTIVE;
    };

    @EventProcessor(ListingCanceledEvent)
    private processListingCanceledEvent = () => {
        this.status = ListingStatus.CANCELED;
    };

    @EventProcessor(ListingUpdatedPriceEvent)
    private processListingUpdatedPriceEvent = () => {
        EMPTY;
    };

    @EventProcessor(ListingSoldEvent)
    private processListingSoldEvent = () => {
        this.status = ListingStatus.SOLD;
    };
}
