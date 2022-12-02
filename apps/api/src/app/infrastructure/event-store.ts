import { Injectable, Logger } from "@nestjs/common";
import { Aggregate } from "./aggregate";
import { MongoClient, ObjectId } from "mongodb";
import { isNil } from "lodash";
import { getLogger, LogAsyncMethod } from "./logging";
import { SourcedEvent } from "./sourced-event";
import { EventSourcedEntity } from "./event-sourced-entity";
import { QueueEventBus } from "./queue-event-bus";
import { EventPayload } from "./serialized-event";
import { EntityManager } from "@mikro-orm/mongodb";
import { ConfigService } from "@nestjs/config";
import { AggregateConcurrencyException } from "./aggregate-concurrency-exception";
import {DateTime} from "luxon";

/**
 * The event store is the main way of saving and reading sourced events. It uses a mongo transaction
 * during save to ensure that all the events and the aggregate are saved as a unit of work. Normally
 * the store process would not be used directly from application code. The commit phase of the
 * EventSourcedEntity will trigger the save process.
 */
@Injectable()
export class EventStore {
    private _mongoClient: MongoClient;
    private _logger: Logger;

    constructor(private _entityManager: EntityManager, configService: ConfigService, private _eventBus: QueueEventBus) {
        this._mongoClient = new MongoClient(configService.get("MONGO_URI"));
        this._logger = getLogger(EventStore);
    }

    /**
     * Builds a publishing function which will replace the publish function of the provided entity.
     * The new function will use the event store to save the events and after that,
     * it will use the event bus to call the async event handlers.
     * @param entity The entity in which the new publishing function will be assigned.
     */
    connectEntity<T extends EventSourcedEntity>(entity: T): T {
        entity.publish = (events: Array<EventPayload>) => {
            if (events.length == 0) {
                return Promise.resolve([]);
            }
            const domainEvents = events.map((serializable) => {
                return new SourcedEvent(entity.id, serializable);
            });
            const aggregate = new Aggregate();
            aggregate.id = entity.id;
            aggregate.version = entity.version;
            return this.save(domainEvents, aggregate).then((savedEvents) => {
                this._eventBus.publishAll(events);
                return Promise.resolve(savedEvents);
            });
        };
        return entity;
    }

    /**
     * Finds and returns all the events that match an aggregate's id.
     * @param id
     */
    @LogAsyncMethod
    findEventsByAggregateId(id: string): Promise<Array<SourcedEvent>> {
        return this._entityManager
            .fork()
            .find(SourcedEvent, { aggregateId: id }, { orderBy: { aggregateVersion: "ASC" } });
    }

    /**
     * Finds and returns all the events that match any of the aggregate ids
     * @param ids
     */
    @LogAsyncMethod
    findEventsByAggregateIds(ids: Array<string>): Promise<Array<SourcedEvent>> {
        return this._entityManager.fork().find(SourcedEvent, { aggregateId: { $in: ids } });
    }

    /**
     * Initiates a transaction process to save the events and the aggregate provided. Before saving,
     * the method will also look for version mismatches and throw an exception if it detects one.
     * @param events The events to be saved
     * @param aggregate The aggregate to be saved
     */
    @LogAsyncMethod
    async save(events: Array<SourcedEvent>, aggregate: Aggregate): Promise<Array<SourcedEvent>> {
        if (events.length === 0) {
            return events;
        }

        let incrementedVersion = 0;
        let finalAggregate: Aggregate;

        let foundAggregate = await this._entityManager.fork().findOne(Aggregate, {
            id: aggregate.id
        });

        const beforeConnect = DateTime.now();
        if (!this._mongoClient.isConnected()) {
            await this._mongoClient.connect();
            this._logger.debug(
                `EventStore Mongo client connected. Duration : ${DateTime.now().diff(beforeConnect).milliseconds} ms`
            );
        }

        const session = this._mongoClient.startSession();
        await session.withTransaction(async () => {
            const eventsCollection = this._mongoClient.db().collection("events");
            const aggregatesCollection = this._mongoClient.db().collection("aggregates");

            if (isNil(foundAggregate)) {
                aggregate.version = 0;
                this._logger.debug(`Aggregate ${aggregate.id} does not exist. Will save it`);
                const mapped = { _id: new ObjectId(aggregate.id), version: aggregate.version };
                await aggregatesCollection.insertOne(mapped);
                foundAggregate = aggregate;
            }

            if (foundAggregate.version !== aggregate.version) {
                this._logger.error(
                    `Concurrency issue for aggregate ${aggregate.id}. Expected ${aggregate.version}. Stored ${foundAggregate.version}`
                );
                throw new AggregateConcurrencyException(aggregate.id, aggregate.version, foundAggregate.version);
            }

            for (let i = 0; i < events.length; i++) {
                incrementedVersion = aggregate.version + i + 1;
                events[i].aggregateVersion = incrementedVersion;
            }
            aggregate.version = incrementedVersion;
            finalAggregate = aggregate;
            this._logger.debug(`Saving ${events.length} events for aggregate ${aggregate.id}`);
            const mapped = events.map((ev) => {
                return {
                    _id: new ObjectId(ev.id),
                    createdAt: ev.createdAt,
                    aggregateId: ev.aggregateId,
                    aggregateVersion: ev.aggregateVersion,
                    eventName: ev.eventName,
                    payload: ev.payload
                };
            });
            await eventsCollection.insertMany(mapped);
            await aggregatesCollection.findOneAndUpdate(
                {
                    _id: new ObjectId(finalAggregate.id)
                },
                {
                    $set: { version: finalAggregate.version }
                }
            );
        });

        return events;
    }
}
