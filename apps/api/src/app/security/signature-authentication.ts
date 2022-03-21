import { MongoDocument } from "../infrastructure/mongo-document";
import { Column, CreateDateColumn, Entity } from "typeorm";
import { Blockchains, SupportedWallets } from "@nft-marketplace/common";

@Entity("signature-authentications")
export class SignatureAuthentication extends MongoDocument {
    @Column()
    address: string;

    @Column()
    message: string;

    @Column()
    wallet: SupportedWallets;

    @Column()
    blockchain: Blockchains;

    @CreateDateColumn()
    createdAt: Date;
}
