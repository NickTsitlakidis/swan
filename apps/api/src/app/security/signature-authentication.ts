import { MongoDocument } from "../infrastructure/mongo-document";
import { Column, CreateDateColumn, Entity } from "typeorm";
import { Blockchains, SignatureWallets } from "@nft-marketplace/common";

@Entity("signature-authentications")
export class SignatureAuthentication extends MongoDocument {
    @Column()
    address: string;

    @Column()
    message: string;

    @Column()
    wallet: SignatureWallets;

    @Column()
    blockchain: Blockchains;

    @CreateDateColumn()
    createdAt: Date;
}
