import { MongoDocument } from "../infrastructure/mongo-document";
import { Column, CreateDateColumn, Entity } from "typeorm";

@Entity("signature-authentications")
export class SignatureAuthentication extends MongoDocument {
    @Column()
    address: string;

    @Column()
    message: string;

    @Column()
    blockchainId: string;

    @Column()
    walletId: string;

    @Column()
    userId: string;

    @Column()
    isEvm: boolean;

    @CreateDateColumn()
    createdAt: Date;
}
