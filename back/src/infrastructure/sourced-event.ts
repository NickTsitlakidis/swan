import { Column, Entity } from "typeorm";
import { ClassConstructor, classToPlain, plainToClass } from "class-transformer";
import { EventBase } from "./event-base";
import { ObjectID as MongoObjectId } from "mongodb";
import * as moment from "moment";
import { getEventNameForObject, hasEventName } from "./serialized-event";
import { MongoDocument } from "./mongo-document";

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
@Entity({ name: "events" })
export class SourcedEvent extends MongoDocument {
    @Column()
    public createdAt: Date;

    @Column()
    public payload: any;

    @Column()
    public aggregateId: string;

    @Column()
    public aggregateVersion: number;

    @Column()
    public eventName: string;

    constructor(aggregateId: string, serializable?: EventBase) {
        super();
        this.aggregateId = aggregateId;
        if (serializable && hasEventName(serializable)) {
            this.payload = classToPlain(serializable);
            this.eventName = getEventNameForObject(serializable);
        }
        this._id = new MongoObjectId();
        this.createdAt = moment.utc().toDate();
    }

    public getPayloadAs<T>(payloadClass: ClassConstructor<T>): T {
        return plainToClass(payloadClass, this.payload);
    }

    public payloadTypeIs(eventName: string): boolean {
        return this.eventName === eventName;
    }
}
