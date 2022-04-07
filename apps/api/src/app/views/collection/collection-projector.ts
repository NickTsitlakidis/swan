import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { CollectionCreatedEvent } from "../../domain/collection/collection-events";
import { LogAsyncMethod } from "../../infrastructure/logging";
import { CollectionLinksView } from "./collection-links-view";
import { CollectionView } from "./collection-view";
import { CollectionViewRepository } from "./collection-view-repository";

@EventsHandler(CollectionCreatedEvent)
export class CollectionProjector implements IEventHandler<CollectionCreatedEvent> {
    constructor(private readonly _repository: CollectionViewRepository) {}

    @LogAsyncMethod
    async handle(event: CollectionCreatedEvent): Promise<CollectionView> {
        const view = new CollectionView();
        view.id = event.aggregateId;
        view.blockchain = event.blockchain;
        view.categoryId = event.categoryId;
        view.customUrl = event.customUrl;
        view.description = event.description;
        view.imageUrl = event.imageUrl;
        view.isExplicit = event.isExplicit;
        view.links = new CollectionLinksView(
            event.instagramLink,
            event.discordLink,
            event.telegramLink,
            event.websiteLink,
            event.mediumLink
        );
        view.name = event.name;
        view.paymentToken = event.paymentToken;
        view.salePercentage = event.salePercentage;

        return this._repository.save(view);
    }
}
