import { Entity } from "typeorm";
import { MongoDocument } from "../../infrastructure/mongo-document";

@Entity("nft-views")
export class NftView extends MongoDocument {
    userId: string;
}