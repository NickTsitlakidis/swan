import { Column, Entity } from "typeorm";
import { MongoDocument } from "../../infrastructure/mongo-document";

@Entity("category-views")
export class CategoryView extends MongoDocument {
    @Column()
    name: string;

    @Column()
    imageUrl: string;
}
