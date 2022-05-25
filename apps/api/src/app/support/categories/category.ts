import { Column, Entity } from "typeorm";
import { MongoDocument } from "../../infrastructure/mongo-document";

@Entity("categories")
export class Category extends MongoDocument {
    @Column()
    name: string;

    @Column()
    imageUrl: string;
}
