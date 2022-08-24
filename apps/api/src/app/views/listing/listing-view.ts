import { MongoDocument } from "../../infrastructure/mongo-document";
import { Embedded, Entity, Property } from "@mikro-orm/core";
import { ListingStatus } from "../../domain/listing/listing-status";
import { ChainTransactionView } from "./chain-transaction-view";

@Entity({ collection: "listing-views" })
export class ListingView extends MongoDocument {
    @Property({ onCreate: () => new Date() })
    createdAt: Date = new Date();

    @Property()
    userId: string;

    @Property()
    price: number;

    @Property()
    nftId?: string;

    @Property()
    categoryId: string;

    @Property()
    blockchainId: string;

    @Property()
    tokenContractAddress?: string;

    @Property()
    chainTokenId?: string;

    @Property()
    status: ListingStatus;

    @Embedded(() => ChainTransactionView, { object: true, nullable: true })
    chainTransaction: ChainTransactionView;

    @Property()
    chainListingId: string;
}
