import { Logger } from "@nestjs/common";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import {
    ListingActivatedEvent,
    ListingCanceledEvent,
    ListingCreatedEvent,
    ListingSoldEvent,
    ListingSubmittedEvent,
    ListingUpdatedPriceEvent
} from "../../domain/listing/listing-events";
import { ListingStatus } from "../../domain/listing/listing-status";
import { getLogger, LogAsyncMethod } from "../../infrastructure/logging";
import { ListingView } from "./listing-view";
import { ListingViewRepository } from "./listing-view-repository";
import { ChainTransactionView } from "./chain-transaction-view";
import { BuyerView } from "./buyer-view";

@EventsHandler(
    ListingActivatedEvent,
    ListingCanceledEvent,
    ListingCreatedEvent,
    ListingSoldEvent,
    ListingSubmittedEvent,
    ListingUpdatedPriceEvent
)
export class ListingProjector
    implements
        IEventHandler<
            | ListingActivatedEvent
            | ListingCanceledEvent
            | ListingCreatedEvent
            | ListingSoldEvent
            | ListingSubmittedEvent
            | ListingUpdatedPriceEvent
        >
{
    private _logger: Logger;

    constructor(private readonly _repository: ListingViewRepository) {
        this._logger = getLogger(ListingProjector);
    }

    @LogAsyncMethod
    async handle(
        event:
            | ListingActivatedEvent
            | ListingCanceledEvent
            | ListingCreatedEvent
            | ListingSoldEvent
            | ListingSubmittedEvent
            | ListingUpdatedPriceEvent
    ): Promise<ListingView> {
        let view: ListingView;

        if (event instanceof ListingCreatedEvent) {
            view = new ListingView();
            view.id = event.aggregateId;
            view.price = event.price;
            view.tokenContractAddress = event.tokenContractAddress;
            view.nftAddress = event.nftAddress;
            view.blockchainId = event.blockchainId;
            view.nftId = event.nftId;
            view.categoryId = event.categoryId;
            view.chainTokenId = event.chainTokenId;
            view.status = ListingStatus.CREATED;
            view.animationUrl = event.animationUrl;
            view.imageUrl = event.imageUrl;
            view.seller = event.seller;
        } else {
            view = await this._repository.findById(event.aggregateId);
        }

        if (!view) {
            this._logger.error(`ListingView with id ${event.aggregateId} was not found`);
            return;
        }

        if (event instanceof ListingSubmittedEvent) {
            view.listingCreatedTransaction = new ChainTransactionView(event.transactionHash);
            view.status = ListingStatus.SUBMITTED;
        }

        if (event instanceof ListingActivatedEvent) {
            view.listingCreatedTransaction.blockNumber = event.blockNumber;
            view.status = ListingStatus.ACTIVE;
            view.chainListingId = event.chainListingId;
        }

        if (event instanceof ListingCanceledEvent) {
            view.status = ListingStatus.CANCELED;
            //todo it would be cool to send user notifications if the cancel is internal and we have user info.
        }

        if (event instanceof ListingSoldEvent) {
            view.status = ListingStatus.SOLD;
            view.listingSoldTransaction = new ChainTransactionView(event.transactionHash, event.blockNumber);
            view.buyer = new BuyerView(event.buyer.walletId, event.buyer.userId, event.buyer.address);
            view.transactionFee = event.transactionFee;
        }

        return this._repository.save(view);
    }
}
