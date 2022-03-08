import { MongoDocument } from "../infrastructure/mongo-document";
import { Column, CreateDateColumn, Entity } from "typeorm";

@Entity("address-authentications")
export class AddressAuthentication extends MongoDocument {
    @Column()
    address: string;

    @Column()
    nonce: string;

    @CreateDateColumn()
    createdAt: Date;
}
