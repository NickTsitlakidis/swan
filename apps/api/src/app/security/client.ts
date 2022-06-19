import { Entity, Property } from "@mikro-orm/core";
import { MongoDocument } from "../infrastructure/mongo-document";

@Entity({ collection: "clients" })
export class Client extends MongoDocument {
    @Property()
    applicationId: string;

    @Property()
    applicationSecret: string;

    @Property()
    applicationName: string;
}
