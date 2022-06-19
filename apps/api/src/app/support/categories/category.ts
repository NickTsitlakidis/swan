import { Entity, Property } from "@mikro-orm/core";
import { MongoDocument } from "../../infrastructure/mongo-document";

@Entity({ collection: "categories" })
export class Category extends MongoDocument {
    @Property()
    name: string;

    @Property()
    imageUrl: string;
}
