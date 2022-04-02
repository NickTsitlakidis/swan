import { Column, Entity } from "typeorm";
import { MongoDocument } from "../../infrastructure/mongo-document";

@Entity("collection-views")
export class CollectionView extends MongoDocument {
    @Column()
    name: string;

    @Column()
    blockchain: string;

    @Column()
    items: Array<object>
}
