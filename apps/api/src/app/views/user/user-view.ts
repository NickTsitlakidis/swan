import { MongoDocument } from "../../infrastructure/mongo-document";
import { CreateDateColumn, Entity } from "typeorm";

@Entity("user-views")
export class UserView extends MongoDocument {
    @CreateDateColumn()
    memberSince: Date;
}
