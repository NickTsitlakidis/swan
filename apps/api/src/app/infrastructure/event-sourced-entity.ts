import { sortBy, last, isNil } from "lodash";
import { InternalServerErrorException, Logger } from "@nestjs/common";
import { SourcedEvent } from "./sourced-event";
import { EventPayload, getEventClassForName } from "./serialized-event";
import { getLogger } from "./logging";

const REGISTERED: Array<{
    eventClass: any;
    processorKey: string;
}> = [];

function getEventProcessorKey(eventClass): string {
    const found = REGISTERED.find((pair) => pair.eventClass === eventClass);
    if (isNil(found)) {
        throw new InternalServerErrorException(`Event class ${eventClass.name} is missing processor.`);
    }

    return found.processorKey;
}

/**
 * A decorator for entity functions which will use an Event to populate the entity. The decorated function will be paired
 * with the provided event class and once a deserialized event is detected and matches the function, the function will be
 * called with the event.
 * @param eventClass The event class that will trigger the function.
 * @constructor
 */
export function EventProcessor(eventClass: any): PropertyDecorator {
    return (propertyParent, propertyKey) => {
        REGISTERED.push({ eventClass: eventClass, processorKey: propertyKey as string });
    };
}

/**
 * The main class that represents a domain entity that uses event sourcing. The class provides functionality to apply,
 * commit and publish events when you need to save information. Additionally, the class provides functionality to build
 * an entity from existing events during read.
 */
export abstract class EventSourcedEntity {
    private _appliedEvents: Array<EventPayload>;
    private _version: number;
    private _logger: Logger;

    protected constructor(private readonly _id: string, events: Array<SourcedEvent> = [], logger?: Logger) {
        this._appliedEvents = [];
        this._version = 0;
        this._logger = isNil(logger) ? getLogger(EventSourcedEntity) : logger;
        if(!isNil(events)) {
            this.buildFromEvents(events);
        }
    }

    get id(): string {
        return this._id;
    }

    get version(): number {
        return this._version;
    }

    get logger(): Logger {
        return this._logger;
    }

    /**
     * Publishes all the provided events using a connected event publisher. To connect a publisher, use the
     * EventStoreConnector. Normally this should never be called by application logic once the connector is used.
     * If a publisher is not connected, the method will return a rejected promise.
     * @param events The events to be published
     */
    publish(events: Array<EventPayload>): Promise<Array<SourcedEvent>> {
        this.logger.error("There is no event publisher assigned");
        return Promise.reject("There is no event publisher assigned");
    }

    /**
     * All the events that have been previously applied will be committed once this method runs. The commit phase has the
     * effect of publishing all the events. After publishing, the applied events will be deleted so that the next commit
     * publishes newer events.
     * During publishing, the events will be saved to Mongo and after the successful save, all the application event
     * handlers will be called to take care of async updates.
     * Call this once all the events you want, have been applied.
     */
    commit(): Promise<EventSourcedEntity> {
        const toPublish = this._appliedEvents.slice(0);
        this._appliedEvents = [];
        if (toPublish.length > 0) {
            return this.publish(toPublish).then(() => Promise.resolve(this));
        }
        return Promise.resolve(this);
    }

    /**
     * Adds an event to the currently applied events of the entity. This will not publish the event. Use the commit
     * method once all the events you want are appliec.
     * @param event The event to be applied
     */
    apply(event: EventPayload) {
        event.aggregateId = this.id;
        this._appliedEvents.push(event);
    }

    /**
     * Returns a clone array of all the currently applied events of the entity.
     */
    get appliedEvents(): Array<EventPayload> {
        return this._appliedEvents.slice(0);
    }

    /**
     * Used when a set of events have been retrieved from the database. These events can be passed to the method and the
     * method will trigger all the matching EventProcessor functions of the entity to populate the object based on
     * application logic.
     * @param events The events that will be sent to EventProcessors
     */
    buildFromEvents(events: Array<SourcedEvent>) {
        if (events.length > 0) {
            this.sortEvents(events).forEach((ev) => {
                try {
                    const eventClass = getEventClassForName(ev.eventName);
                    const processor = getEventProcessorKey(eventClass);
                    const mappedEvent = ev.getPayloadAs(eventClass);
                    this[processor](mappedEvent);
                } catch (error) {
                    this.logger.error(`Unable to process domain event : ${ev.eventName}.`);
                    throw error;
                }
            });

            this.resolveVersion(events);
        }
    }

    protected resolveVersion(events: Array<SourcedEvent>) {
        const sorted: Array<SourcedEvent> = sortBy(events, (ev) => ev.aggregateVersion);
        this._version = last(sorted).aggregateVersion;
    }

    protected sortEvents(events: Array<SourcedEvent>): Array<SourcedEvent> {
        return sortBy(events, (ev) => ev.aggregateVersion);
    }
}
