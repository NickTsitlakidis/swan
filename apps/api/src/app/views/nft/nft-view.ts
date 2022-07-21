import { MongoDocument } from "../../infrastructure/mongo-document";
import { Entity, Property } from "@mikro-orm/core";

@Entity({ collection: "nft-views" })
export class NftView extends MongoDocument {
    @Property({ onCreate: () => new Date() })
    createdAt: Date = new Date();

    @Property()
    userId: string;

    @Property()
    categoryId: string;

    @Property()
    metadataUri: string;

    @Property()
    fileUri: string;

    @Property()
    blockchainId: string;

    @Property()
    collectionId?: string;

    @Property()
    transactionId?: string;

    @Property()
    tokenAddress?: string;

    @Property()
    tokenId?: string;
}
