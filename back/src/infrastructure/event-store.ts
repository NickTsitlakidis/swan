import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { Connection, MongoRepository } from "typeorm";
import { Aggregate } from "./aggregate";
import { MongoClient } from "mongodb";
import { ObjectID as MongoObjectId } from "mongodb";
import { isNil } from "lodash";
import { getLogger, LogAsyncMethod } from "./logging";
import { SourcedEvent } from "./sourced-event";

/**
 * The event store is the main way of saving and reading sourced events. It uses a mongo transaction
 * during save to ensure that all the events and the aggregate are saved as a unit of work. Normally
 * the class would not be used directly from application code. The commit phase of the
 * EventSourcedEntity will trigger the save process.
 */
@Injectable()
export class EventStore {
    private eventRepository: MongoRepository<SourcedEvent>;
    private aggregateRepository: MongoRepository<Aggregate>;
    private mongoClient: MongoClient;
    private _logger: Logger;

    constructor(databaseConnection: Connection) {
        this.eventRepository = databaseConnection.getMongoRepository(SourcedEvent);
        this.aggregateRepository = databaseConnection.getMongoRepository(Aggregate);
        this.mongoClient = (databaseConnection.driver as any).queryRunner.databaseConnection;
        this._logger = getLogger(EventStore);
    }

    /**
     * Finds and returns all the events that match an aggregate's id.
     * @param id
     */
    @LogAsyncMethod
    findEventByAggregateId(id: string): Promise<Array<SourcedEvent>> {
        return this.eventRepository.find({
            where: { aggregateId: id },
            order: { aggregateVersion: "ASC" }
        });
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

        let foundAggregate = await this.aggregateRepository.findOne({
            _id: new MongoObjectId(aggregate.id)
        });

        const session = this.mongoClient.startSession();

        await session.withTransaction(async () => {
            const eventsCollection = this.mongoClient.db().collection("events");
            const aggregatesCollection = this.mongoClient.db().collection("aggregates");

            if (isNil(foundAggregate)) {
                aggregate.version = 0;
                this._logger.debug(`Aggregate ${aggregate.id} does not exist. Will save it`);
                const mapped = { _id: new MongoObjectId(aggregate.id), version: aggregate.version };
                await aggregatesCollection.insertOne(mapped);
                foundAggregate = aggregate;
            }

            if (foundAggregate.version !== aggregate.version) {
                this._logger.error(
                    `Concurrency issue for aggregate ${aggregate.id}. Expected ${aggregate.version}. Stored ${foundAggregate.version}`
                );
                throw new InternalServerErrorException("Event concurrency issue");
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
                    _id: new MongoObjectId(ev.id),
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
                    _id: new MongoObjectId(finalAggregate.id)
                },
                {
                    $set: { version: finalAggregate.version }
                }
            );
        });

        return events;
    }
}
