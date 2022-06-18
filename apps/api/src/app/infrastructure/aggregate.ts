import { MongoDocument } from "./mongo-document";
import { Entity, Property } from "@mikro-orm/core";

/**
 * A class that matches an aggregate of our domain. Its main usage is to hold the version information so that it can
 * be retrieved easily.
 *
 * Like SourcedEvent, this document is handled by the EventStore. New fields that will be added here need to be reflected
 * there (EventStore) too.
 */
@Entity({ collection: "aggregates" })
export class Aggregate extends MongoDocument {
    @Property()
    version: number;

    constructor() {
        super();
        this.version = 0;
    }
}
