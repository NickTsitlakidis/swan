import { MongoDocument } from "../../infrastructure/mongo-document";
import { Embedded, Entity, Property } from "@mikro-orm/core";
import { ListingStatus } from "../../domain/listing/listing-status";
import { ChainTransactionView } from "./chain-transaction-view";
import { TransactionFeeView } from "./transaction-fee-view";
import { BuyerView } from "./buyer-view";

@Entity({ collection: "listing-views" })
export class ListingView extends MongoDocument {
    @Property({ onCreate: () => new Date() })
    createdAt: Date = new Date();

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
    nftAddress?: string;

    //todo : refactor this to number
    @Property()
    chainTokenId?: string;

    @Property()
    status: ListingStatus;

    @Embedded(() => ChainTransactionView, { object: true, nullable: true })
    listingCreatedTransaction: ChainTransactionView;

    @Embedded(() => ChainTransactionView, { object: true, nullable: true })
    listingSoldTransaction: ChainTransactionView;

    @Embedded(() => TransactionFeeView, { object: true, nullable: true })
    transactionFee: TransactionFeeView;

    @Embedded(() => BuyerView, { object: true, nullable: true })
    buyer: BuyerView;

    @Embedded(() => BuyerView, { object: true, nullable: true })
    seller: BuyerView;

    @Property()
    chainListingId: number;

    @Property()
    animationUrl?: string;

    @Property()
    imageUrl: string;
}
