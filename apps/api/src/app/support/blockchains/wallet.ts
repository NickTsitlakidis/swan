import { MongoDocument } from "../../infrastructure/mongo-document";
import { Column, Entity } from "typeorm";

@Entity("wallets")
export class Wallet extends MongoDocument {
    @Column()
    name: string;

    @Column()
    supportsSignatureAuthentication: boolean;
}
