import { Injectable } from "@nestjs/common";
import { EventStore } from "./event-store";
import { EventSourcedEntity } from "./event-sourced-entity";
import { Aggregate } from "./aggregate";
import { EventBase } from "./event-base";
import { QueueEventBus } from "./queue-event-bus";
import { SourcedEvent } from "./sourced-event";

@Injectable()
export class EventStoreConnector {
    constructor(private _eventBus: QueueEventBus, private _eventStore: EventStore) {}

    /**
     * Builds a publishing function which will replace the publish function of the provided entity.
     * The new function will use the event store to save the events and after that successful save,
     * it will use the event bus to call the async event handlers.
     * @param entity The entity in which the new publishing function will be assigned.
     */
    public connect<T extends EventSourcedEntity>(entity: T): T {
        entity.publish = (events: Array<EventBase>) => {
            if (events.length == 0) {
                return Promise.resolve([]);
            }
            const domainEvents = events.map((serializable) => {
                return new SourcedEvent(entity.id, serializable);
            });
            const aggregate = new Aggregate();
            aggregate.id = entity.id;
            aggregate.version = entity.version;
            return this._eventStore.save(domainEvents, aggregate).then((savedEvents) => {
                this._eventBus.publishAll(events);
                return Promise.resolve(savedEvents);
            });
        };
        return entity;
    }
}
