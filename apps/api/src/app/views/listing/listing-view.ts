import { MongoDocument } from "../../infrastructure/mongo-document";
import { Embedded, Entity, Property } from "@mikro-orm/core";
import { ChainTransaction } from "../../commands/listing/chain-transaction";
import { ListingStatus } from "../../domain/listing/listing-status";

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

    @Embedded(() => ListingStatus, { object: true, nullable: true })
    status: ListingStatus;

    @Embedded(() => ChainTransaction, { object: true, nullable: true })
    chainTransaction: ChainTransaction;

    @Property()
    chainListingId: string;
}
