import { CollectionLinksView } from "./collection-links-view";
import { MongoDocument } from "../../infrastructure/mongo-document";
import { Embedded, Entity, Property } from "@mikro-orm/core";

@Entity({ collection: "collection-views" })
export class CollectionView extends MongoDocument {
    @Property()
    name: string;

    @Property()
    categoryId: string;

    @Property()
    customUrl: string;

    @Property()
    description: string;

    @Property()
    isExplicit: boolean;

    @Property()
    logoImageUrl: string;

    @Property()
    bannerImageUrl: string;

    @Property()
    volume: number;

    @Property()
    totalItems: number;

    @Embedded(() => CollectionLinksView, { object: true, nullable: true })
    links: CollectionLinksView;

    @Property()
    salePercentage: number;

    @Property()
    blockchainId: string;

    @Property()
    paymentTokenSymbol: string;

    @Property()
    userId: string;

    @Property()
    collectionAddress: string;

    @Property()
    family: string;

    @Property({ onCreate: () => new Date() })
    createdAt: Date = new Date();
}
