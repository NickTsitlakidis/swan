import { MongoDocument } from "../../infrastructure/mongo-document";
import { Entity, Property } from "@mikro-orm/core";

@Entity({ collection: "user-views" })
export class UserView extends MongoDocument {
    @Property({ onCreate: () => new Date() })
    memberSince: Date = new Date();
}
