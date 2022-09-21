import { MongoDocument } from "../../infrastructure/mongo-document";
import { Entity, Property } from "@mikro-orm/core";

@Entity({ collection: "nft-views" })
export class NftView extends MongoDocument {
    @Property({ onCreate: () => new Date() })
    createdAt: Date = new Date();

    @Property()
    userId: string;

    @Property()
    userWalletId: string;

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
    tokenContractAddress?: string;

    @Property()
    tokenId?: string;

    //todo check this. how and when to add values?
    @Property()
    nftAddress?: string;
}
