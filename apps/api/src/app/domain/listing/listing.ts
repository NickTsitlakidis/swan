import { EventProcessor, EventSourcedEntity } from "../../infrastructure/event-sourced-entity";
import { SourcedEvent } from "../../infrastructure/sourced-event";
import { getLogger } from "../../infrastructure/logging";
import { CreateListingCommand } from "../../commands/listing/create-listing-command";
import { ListingStatus } from "./listing-status";
import { ChainTransaction } from "./chain-transaction";
import {
    ListingActivatedEvent,
    ListingCanceledEvent,
    ListingCreatedEvent,
    ListingSoldEvent,
    ListingSubmittedEvent,
    ListingUpdatedPriceEvent
} from "./listing-events";
import { EMPTY } from "rxjs";
import { Buyer } from "./buyer";
import { CurrencyList, INVALID_LISTING_STATUS } from "@swan/dto";
import { TransactionFee } from "./transaction-fee";
import { ApiException } from "../../infrastructure/api-exception";

export class Listing extends EventSourcedEntity {
    private _price: number;
    private _nftId?: string;
    private _categoryId: string;
    private _blockchainId: string;
    private _marketPlaceContractAddress?: string;
    private _tokenContractAddress?: string;
    private _nftAddress?: string;
    private _chainTokenId?: string;
    private _status: ListingStatus;
    private _listingCreatedTransaction: ChainTransaction;
    private _listingSoldTransaction: ChainTransaction;
    private _buyer: Buyer; // todo refactor the buyer to be a class for buyer and seller. also include wallet address there
    private _seller: Buyer;
    private _chainListingId: number;
    private _animationUrl: string;
    private _imageUrl: string;
    private _transactionFee: TransactionFee;

    static fromEvents(id: string, events: Array<SourcedEvent>): Listing {
        const listing = new Listing(id);
        listing.processEvents(events);
        return listing;
    }

    static create(id: string, command: CreateListingCommand, sellerAddress: string): Listing {
        const listing = new Listing(id);
        listing._price = command.price;
        listing._tokenContractAddress = command.tokenContractAddress;
        listing._nftAddress = command.nftAddress;
        listing._blockchainId = command.blockchainId;
        listing._nftId = command.nftId;
        listing._categoryId = command.categoryId;
        listing._chainTokenId = command.chainTokenId;
        listing._status = ListingStatus.CREATED;
        listing._animationUrl = command.animationUrl;
        listing._imageUrl = command.imageUrl;
        listing._marketPlaceContractAddress = command.marketPlaceContractAddress;
        listing._seller = new Buyer(command.userId, command.walletId, sellerAddress);

        const event = new ListingCreatedEvent(
            listing._seller,
            listing._price,
            listing._categoryId,
            listing._blockchainId,
            listing._imageUrl,
            listing._animationUrl,
            listing._tokenContractAddress,
            listing._nftAddress,
            listing._chainTokenId,
            listing._nftId,
            listing._marketPlaceContractAddress
        );

        listing.apply(event);
        return listing;
    }

    private constructor(id: string) {
        super(id, getLogger(Listing));
    }

    public get blockchainId(): string {
        return this._blockchainId;
    }

    public get nftId(): string {
        return this._nftId;
    }

    public get categoryId(): string {
        return this._categoryId;
    }

    get marketPlaceContractAddress(): string {
        return this._marketPlaceContractAddress;
    }

    get seller(): Buyer {
        return this._seller;
    }

    get price(): number {
        return this._price;
    }

    get tokenContractAddress(): string {
        return this._tokenContractAddress;
    }

    get nftAddress(): string {
        return this._nftAddress;
    }

    get chainTokenId(): string {
        return this._chainTokenId;
    }

    get status(): ListingStatus {
        return this._status;
    }

    get listingSoldTransaction(): ChainTransaction {
        return this._listingSoldTransaction;
    }

    get buyer(): Buyer {
        return this._buyer;
    }

    get chainListingId(): number {
        return this._chainListingId;
    }

    get animationUrl(): string {
        return this._animationUrl;
    }

    get imageUrl(): string {
        return this._imageUrl;
    }

    get transactionFee(): TransactionFee {
        return this._transactionFee;
    }

    get listingCreatedTransaction(): ChainTransaction {
        return this._listingCreatedTransaction;
    }

    submitToChain(transactionHash: string) {
        if (this._status !== ListingStatus.CREATED) {
            throw new ApiException(`Listing with id ${this.id} is not CREATED`, true, INVALID_LISTING_STATUS);
        }

        this._listingCreatedTransaction = new ChainTransaction();
        this._listingCreatedTransaction.transactionHash = transactionHash;
        this._status = ListingStatus.SUBMITTED;
        this.apply(new ListingSubmittedEvent(transactionHash));
    }

    activate(blockNumber: number, chainListingId: number) {
        if (this._status !== ListingStatus.SUBMITTED) {
            throw new ApiException(`Listing with id ${this.id} is not SUBMITTED`, true, INVALID_LISTING_STATUS);
        }

        this._listingCreatedTransaction.blockNumber = blockNumber;
        this._chainListingId = chainListingId;
        this._status = ListingStatus.ACTIVE;
        this.apply(new ListingActivatedEvent(blockNumber, chainListingId));
    }

    buy(
        transactionHash: string,
        buyer: Buyer,
        transactionFeePercentage: number,
        currency: CurrencyList,
        blockNumber?: number
    ) {
        if (this._status !== ListingStatus.ACTIVE) {
            throw new ApiException(`Listing with id ${this.id} is not ACTIVE`, true, INVALID_LISTING_STATUS);
        }

        this._listingSoldTransaction = new ChainTransaction();
        this._listingSoldTransaction.transactionHash = transactionHash;
        this._listingSoldTransaction.blockNumber = blockNumber;
        this._buyer = buyer;
        this._transactionFee = {
            amount: (this._price * transactionFeePercentage) / 100,
            currency
        };
        this._status = ListingStatus.SOLD;
        this.apply(new ListingSoldEvent(transactionHash, buyer, this._transactionFee, blockNumber));
    }

    cancel(isInternalCancel = false) {
        if (this._status !== ListingStatus.ACTIVE) {
            throw new ApiException(`Listing with id ${this.id} is not ACTIVE`, true, INVALID_LISTING_STATUS);
        }

        this._status = ListingStatus.CANCELED;
        this.apply(new ListingCanceledEvent(isInternalCancel));
    }

    @EventProcessor(ListingCreatedEvent)
    private processListingCreatedEvent = (event: ListingCreatedEvent) => {
        this._price = event.price;
        this._tokenContractAddress = event.tokenContractAddress;
        this._nftAddress = event.nftAddress;
        this._blockchainId = event.blockchainId;
        this._nftId = event.nftId;
        this._categoryId = event.categoryId;
        this._chainTokenId = event.chainTokenId;
        this._status = ListingStatus.CREATED;
        this._animationUrl = event.animationUrl;
        this._imageUrl = event.imageUrl;
        this._marketPlaceContractAddress = event.marketPlaceContractAddress;
        this._seller = event.seller;
    };

    @EventProcessor(ListingSubmittedEvent)
    private processListingSubmittedEvent = (event: ListingSubmittedEvent) => {
        this._listingCreatedTransaction = {
            transactionHash: event.transactionHash
        };
        this._status = ListingStatus.SUBMITTED;
    };

    @EventProcessor(ListingActivatedEvent)
    private processListingActivatedEvent = (event: ListingActivatedEvent) => {
        this._listingCreatedTransaction.blockNumber = event.blockNumber;
        this._chainListingId = event.chainListingId;
        this._status = ListingStatus.ACTIVE;
    };

    @EventProcessor(ListingCanceledEvent)
    private processListingCanceledEvent = () => {
        this._status = ListingStatus.CANCELED;
    };

    @EventProcessor(ListingUpdatedPriceEvent)
    private processListingUpdatedPriceEvent = () => {
        EMPTY;
    };

    @EventProcessor(ListingSoldEvent)
    private processListingSoldEvent = (event: ListingSoldEvent) => {
        this._listingSoldTransaction = new ChainTransaction();
        this._listingSoldTransaction.transactionHash = event.transactionHash;
        this._listingSoldTransaction.blockNumber = event.blockNumber;
        this._buyer = event.buyer;
        this._transactionFee = event.transactionFee;
        this._status = ListingStatus.SOLD;
    };
}
