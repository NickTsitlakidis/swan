import { EventSourcedEntity } from "../../infrastructure/event-sourced-entity";
import { SourcedEvent } from "../../infrastructure/sourced-event";
import { getLogger } from "../../infrastructure/logging";
import { CreateListingCommand } from "../../commands/listing/create-listing-command";
import { ListingStatus } from "./listing-status";
import { ChainTransaction } from "../../commands/listing/chain-transaction";
import { ListingActivatedEvent, ListingCreatedEvent, ListingSubmittedEvent } from "./listing-events";
import { BadRequestException } from "@nestjs/common";

export class Listing extends EventSourcedEntity {
    private price: number;
    private nftId?: string;
    private categoryId: string;
    private blockchainId: string;
    private tokenContractAddress?: string;
    private chainTokenId?: string;
    private userId: string;
    private status: ListingStatus;
    private chainTransaction: ChainTransaction;
    private chainListingId: string;

    static fromEvents(id: string, events: Array<SourcedEvent>): Listing {
        const listing = new Listing(id);
        listing.processEvents(events);
        return listing;
    }

    static create(id: string, command: CreateListingCommand): Listing {
        const listing = new Listing(id);
        listing.price = command.price;
        listing.tokenContractAddress = command.tokenContractAddress;
        listing.blockchainId = command.blockchainId;
        listing.nftId = command.nftId;
        listing.categoryId = command.categoryId;
        listing.userId = command.userId;
        listing.chainTokenId = command.chainTokenId;
        listing.status = ListingStatus.CREATED;

        const event = new ListingCreatedEvent(
            listing.price,
            listing.userId,
            listing.categoryId,
            listing.blockchainId,
            listing.tokenContractAddress,
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

    activate(blockNumber: number) {
        if (this.status !== ListingStatus.SUBMITTED) {
            throw new BadRequestException(`Listing with id ${this.id} is not SUBMITTED`);
        }

        this.chainTransaction.blockNumber = blockNumber;
        this.status = ListingStatus.ACTIVE;
        this.apply(new ListingActivatedEvent(blockNumber));
    }
}
