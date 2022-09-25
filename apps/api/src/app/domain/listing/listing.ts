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
    private _price: number;
    private _nftId?: string;
    private _categoryId: string;
    private _blockchainId: string;
    private _marketPlaceContractAddress?: string;
    private _tokenContractAddress?: string;
    private _nftAddress?: string;
    private _chainTokenId?: string;
    private _userId: string;
    private _status: ListingStatus;
    private _listingCreatedTransaction: ChainTransaction;
    private _listingSoldTransaction: ChainTransaction;
    private _buyer: Buyer;
    private _chainListingId: number;
    private _walletId: string;
    private _animationUrl: string;
    private _imageUrl: string;
    private _transactionFee: TransactionFee;

    static fromEvents(id: string, events: Array<SourcedEvent>): Listing {
        const listing = new Listing(id);
        listing.processEvents(events);
        return listing;
    }

    static create(id: string, command: CreateListingCommand): Listing {
        const listing = new Listing(id);
        listing._price = command.price;
        listing._tokenContractAddress = command.tokenContractAddress;
        listing._nftAddress = command.nftAddress;
        listing._blockchainId = command.blockchainId;
        listing._nftId = command.nftId;
        listing._categoryId = command.categoryId;
        listing._userId = command.userId;
        listing._chainTokenId = command.chainTokenId;
        listing._status = ListingStatus.CREATED;
        listing._walletId = command.walletId;
        listing._animationUrl = command.animationUrl;
        listing._imageUrl = command.imageUrl;
        listing._marketPlaceContractAddress = command.marketPlaceContractAddress;

        const event = new ListingCreatedEvent(
            listing._price,
            listing._userId,
            listing._categoryId,
            listing._blockchainId,
            listing._walletId,
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

    public get walletId(): string {
        return this._walletId;
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

    submitToChain(chainTransactionId: string) {
        if (this._status !== ListingStatus.CREATED) {
            throw new BadRequestException(`Listing with id ${this.id} is not CREATED`);
        }

        this._listingCreatedTransaction = new ChainTransaction();
        this._listingCreatedTransaction.transactionId = chainTransactionId;
        this._status = ListingStatus.SUBMITTED;
        this.apply(new ListingSubmittedEvent(chainTransactionId));
        //todo run a listener for chain events here
    }

    activate(blockNumber: number, chainListingId: number) {
        if (this._status !== ListingStatus.SUBMITTED) {
            throw new BadRequestException(`Listing with id ${this.id} is not SUBMITTED`);
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
        walletId: string,
        blockNumber?: number
    ) {
        if (this._status !== ListingStatus.ACTIVE) {
            throw new BadRequestException(`Listing with id ${this.id} is not ACTIVE`);
        }

        this._walletId = walletId;
        this._listingSoldTransaction = new ChainTransaction();
        this._listingSoldTransaction.transactionId = transactionHash;
        this._listingSoldTransaction.blockNumber = blockNumber;
        this._buyer = buyer;
        this._transactionFee = {
            amount: (this._price * transactionFeePercentage) / 100,
            currency
        };
        this._status = ListingStatus.SOLD;
        this.apply(new ListingSoldEvent(transactionHash, buyer, this._transactionFee, blockNumber));
    }

    @EventProcessor(ListingCreatedEvent)
    private processListingCreatedEvent = (event: ListingCreatedEvent) => {
        this._price = event.price;
        this._tokenContractAddress = event.tokenContractAddress;
        this._nftAddress = event.nftAddress;
        this._blockchainId = event.blockchainId;
        this._nftId = event.nftId;
        this._categoryId = event.categoryId;
        this._walletId = event.walletId;
        this._userId = event.userId;
        this._chainTokenId = event.chainTokenId;
        this._status = ListingStatus.CREATED;
        this._animationUrl = event.animationUrl;
        this._imageUrl = event.imageUrl;
        this._marketPlaceContractAddress = event.marketPlaceContractAddress;
    };

    @EventProcessor(ListingSubmittedEvent)
    private processListingSubmittedEvent = (event: ListingSubmittedEvent) => {
        this._listingCreatedTransaction = {
            transactionId: event.chainTransactionId
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
        this._listingSoldTransaction.transactionId = event.transactionHash;
        this._listingSoldTransaction.blockNumber = event.blockNumber;
        this._buyer = event.buyer;
        this._transactionFee = event.transactionFee;
        this._status = ListingStatus.SOLD;
    };
}
