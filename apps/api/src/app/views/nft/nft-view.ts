import { MongoDocument } from "../../infrastructure/mongo-document";
import { Entity } from "@mikro-orm/core";

@Entity({collection:"nft-views"})
export class NftView extends MongoDocument {
    userId: string;
}