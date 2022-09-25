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
import { Buyer } from "./buyer";
import { TransactionFee } from "./transaction";
import { CurrencyList } from "@swan/dto";

export class Listing extends EventSourcedEntity {
    private price: number;
    private nftId?: string;
    private categoryId: string;
    private _blockchainId: string;
    private _marketPlaceContractAddress?: string;
    private tokenContractAddress?: string;
    private nftAddress?: string;
    private chainTokenId?: string;
    private userId: string;
    private status: ListingStatus;
    private listingCreatedTransaction: ChainTransaction;
    private listingSoldTransaction: ChainTransaction;
    private buyer: Buyer;
    private chainListingId: number;
    private _walletId: string;
    private animationUrl: string;
    private imageUrl: string;
    private transactionFee: TransactionFee;

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
        listing._blockchainId = command.blockchainId;
        listing.nftId = command.nftId;
        listing.categoryId = command.categoryId;
        listing.userId = command.userId;
        listing.chainTokenId = command.chainTokenId;
        listing.status = ListingStatus.CREATED;
        listing._walletId = command.walletId;
        listing.animationUrl = command.animationUrl;
        listing.imageUrl = command.imageUrl;
        listing._marketPlaceContractAddress = command.marketPlaceContractAddress;

        const event = new ListingCreatedEvent(
            listing.price,
            listing.userId,
            listing.categoryId,
            listing._blockchainId,
            listing._walletId,
            listing.imageUrl,
            listing.animationUrl,
            listing.tokenContractAddress,
            listing.nftAddress,
            listing.chainTokenId,
            listing.nftId,
            listing._marketPlaceContractAddress
        );

        listing.apply(event);
        return listing;
    }

    private constructor(id: string) {
        super(id, getLogger(Listing));
    }

    public get walletId(): string {
        return this._walletId;
    }

    public get blockchainId(): string {
        return this._blockchainId;
    }

    get marketPlaceContractAddress(): string {
        return this._marketPlaceContractAddress;
    }

    submitToChain(chainTransactionId: string) {
        if (this.status !== ListingStatus.CREATED) {
            throw new BadRequestException(`Listing with id ${this.id} is not CREATED`);
        }

        this.listingCreatedTransaction = new ChainTransaction();
        this.listingCreatedTransaction.transactionId = chainTransactionId;
        this.status = ListingStatus.SUBMITTED;
        this.apply(new ListingSubmittedEvent(chainTransactionId));
        //todo run a listener for chain events here
    }

    activate(blockNumber: number, chainListingId: number) {
        if (this.status !== ListingStatus.SUBMITTED) {
            throw new BadRequestException(`Listing with id ${this.id} is not SUBMITTED`);
        }

        this.listingCreatedTransaction.blockNumber = blockNumber;
        this.chainListingId = chainListingId;
        this.status = ListingStatus.ACTIVE;
        this.apply(new ListingActivatedEvent(blockNumber, chainListingId));
    }

    buy(
        transactionHash: string,
        buyer: Buyer,
        transactionFeePercentage: number,
        currency: CurrencyList,
        blockNumber?: number
    ) {
        if (this.status !== ListingStatus.ACTIVE) {
            throw new BadRequestException(`Listing with id ${this.id} is not ACTIVE`);
        }

        this.listingSoldTransaction = new ChainTransaction();
        this.listingSoldTransaction.transactionId = transactionHash;
        this.listingSoldTransaction.blockNumber = blockNumber;
        this.buyer = buyer;
        this.transactionFee = {
            amount: (this.price * transactionFeePercentage) / 100,
            currency
        };
        this.status = ListingStatus.SOLD;
        this.apply(new ListingSoldEvent(transactionHash, buyer, this.transactionFee, blockNumber));
    }

    @EventProcessor(ListingCreatedEvent)
    private processListingCreatedEvent = (event: ListingCreatedEvent) => {
        this.price = event.price;
        this.tokenContractAddress = event.tokenContractAddress;
        this.nftAddress = event.nftAddress;
        this._blockchainId = event.blockchainId;
        this.nftId = event.nftId;
        this.categoryId = event.categoryId;
        this._walletId = event.walletId;
        this.userId = event.userId;
        this.chainTokenId = event.chainTokenId;
        this.status = ListingStatus.CREATED;
        this.animationUrl = event.animationUrl;
        this.imageUrl = event.imageUrl;
        this._marketPlaceContractAddress = event.marketPlaceContractAddress;
    };

    @EventProcessor(ListingSubmittedEvent)
    private processListingSubmittedEvent = (event: ListingSubmittedEvent) => {
        this.listingCreatedTransaction = {
            transactionId: event.chainTransactionId
        };
        this.status = ListingStatus.SUBMITTED;
    };

    @EventProcessor(ListingActivatedEvent)
    private processListingActivatedEvent = (event: ListingActivatedEvent) => {
        this.listingCreatedTransaction.blockNumber = event.blockNumber;
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
    private processListingSoldEvent = (event: ListingSoldEvent) => {
        this.listingSoldTransaction = new ChainTransaction();
        this.listingSoldTransaction.transactionId = event.transactionHash;
        this.listingSoldTransaction.blockNumber = event.blockNumber;
        this.buyer = event.buyer;
        this.transactionFee = event.transactionFee;
        this.status = ListingStatus.SOLD;
    };
}
