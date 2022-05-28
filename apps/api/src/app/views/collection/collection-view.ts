import { MongoDocument } from "../../infrastructure/mongo-document";
import { Column, CreateDateColumn, Entity } from "typeorm";
import { CollectionLinksView } from "./collection-links-view";

@Entity("collection-views")
export class CollectionView extends MongoDocument {
    @Column()
    name: string;

    @Column()
    categoryId: string;

    @Column()
    customUrl: string;

    @Column()
    description: string;

    @Column()
    isExplicit: boolean;

    @Column()
    imageUrl: string;

    @Column(() => CollectionLinksView)
    links: CollectionLinksView;

    @Column()
    salePercentage: number;

    @Column()
    blockchainId: string;

    @Column()
    paymentToken: string;

    @CreateDateColumn()
    createdAt: Date;
}
