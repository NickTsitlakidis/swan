import { Logger } from "@nestjs/common";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import {
    ListingActivatedEvent,
    ListingCanceledEvent,
    ListingCreatedEvent,
    ListingSoldEvent,
    ListingSubmittedEvent,
    ListingUpdatedPriceEvent
} from "../../domain/Listing/Listing-events";
import { ListingStatus } from "../../domain/listing/listing-status";
import { getLogger, LogAsyncMethod } from "../../infrastructure/logging";
import { ListingView } from "./listing-view";
import { ListingViewRepository } from "./listing-view-repository";

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
            view.blockchainId = event.blockchainId;
            view.nftId = event.nftId;
            view.categoryId = event.categoryId;
            view.userId = event.userId;
            view.chainTokenId = event.chainTokenId;
            view.status = ListingStatus.CREATED;
        } else {
            view = await this._repository.findById(event.aggregateId);
        }

        if (!view) {
            this._logger.error("ListingView was not found");
            return;
        }

        if (event instanceof ListingSubmittedEvent) {
            view.chainTransaction.transactionId = event.chainTransactionId;
            view.status = ListingStatus.SUBMITTED;
        }

        if (event instanceof ListingActivatedEvent) {
            view.chainTransaction.blockNumber = event.blockNumber;
            view.status = ListingStatus.ACTIVE;
        }

        if (event instanceof ListingCanceledEvent) {
            view.status = ListingStatus.CANCELED;
        }

        if (event instanceof ListingUpdatedPriceEvent) {
            view.status = ListingStatus.UPDATE_PRICE;
        }

        if (event instanceof ListingSoldEvent) {
            view.status = ListingStatus.SOLD;
        }

        return this._repository.save(view);
    }
}
