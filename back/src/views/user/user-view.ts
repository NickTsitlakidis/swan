import { MongoDocument } from "../../infrastructure/mongo-document";
import { Column, CreateDateColumn, Entity } from "typeorm";

@Entity("user-views")
export class UserView extends MongoDocument {
    @Column()
    walletAddress: string;

    @CreateDateColumn()
    memberSince: Date;
}
