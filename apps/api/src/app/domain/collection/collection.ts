import { EventProcessor, EventSourcedEntity } from "../../infrastructure/event-sourced-entity";
import { SourcedEvent } from "../../infrastructure/sourced-event";
import { getLogger } from "../../infrastructure/logging";
import { CreateCollectionCommand } from "../../commands/collection/create-collection-command";
import { CollectionCreatedEvent } from "./collection-events";

export class Collection extends EventSourcedEntity {
    static fromEvents(id: string, events: Array<SourcedEvent>): Collection {
        const c = new Collection(id);
        c.processEvents(events);
        return c;
    }

    static create(id: string, command: CreateCollectionCommand): Collection {
        const c = new Collection(id);
        const event = new CollectionCreatedEvent(
            command.userId,
            command.name,
            command.categoryId,
            command.customUrl,
            command.description,
            command.isExplicit,
            command.imageUrl,
            command.salePercentage,
            command.blockchain,
            command.paymentToken,
            command.links.instagram,
            command.links.medium,
            command.links.telegram,
            command.links.website,
            command.links.discord
        );
        c.apply(event);
        return c;
    }

    private constructor(id: string) {
        super(id, getLogger(Collection));
    }

    @EventProcessor(CollectionCreatedEvent)
    private processCollectionCreatedEvent = (event: CollectionCreatedEvent) => {};
}
