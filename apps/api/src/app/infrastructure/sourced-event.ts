import { ClassConstructor, instanceToPlain, plainToClass } from "class-transformer";
import * as moment from "moment";
import { EventPayload, getEventNameForObject, hasEventName } from "./serialized-event";
import { MongoDocument } from "./mongo-document";
import { Entity, Property } from "@mikro-orm/core";
import { ObjectId } from "mongodb";

/**
 * The main document that's saved as a sourced event in Mongo. It includes basic metadata like creation date, version
 * and ids. Additionally, it includes the serialized json representation of the payload and the name that matches the
 * event.
 *
 * Persisting this kind of documents require Mongo transactions and additional persistence of Aggregate objects. Use
 * EventStore for persistence and avoid repositories.
 *
 * New fields in this class need to be reflected in event store transaction mappings.
 */
@Entity({ collection: "events" })
export class SourcedEvent extends MongoDocument {
    @Property({ onCreate: () => new Date() })
    public createdAt: Date = new Date();

    @Property()
    public payload: unknown;

    @Property()
    public aggregateId: string;

    @Property()
    public aggregateVersion: number;

    @Property()
    public eventName: string;

    constructor(aggregateId: string, serializable?: EventPayload) {
        super();
        this.aggregateId = aggregateId;
        if (serializable && hasEventName(serializable)) {
            this.payload = instanceToPlain(serializable, { exposeUnsetFields: false });
            this.eventName = getEventNameForObject(serializable);
        }
        this._id = new ObjectId();
        this.createdAt = moment.utc().toDate();
    }

    public getPayloadAs<T>(payloadClass: ClassConstructor<T>): T {
        return plainToClass(payloadClass, this.payload);
    }

    public payloadTypeIs(eventName: string): boolean {
        return this.eventName === eventName;
    }
}
