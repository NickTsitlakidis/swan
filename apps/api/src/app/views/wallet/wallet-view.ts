import { Blockchains, SupportedWallets } from "@nft-marketplace/common";
import { Column, Entity } from "typeorm";
import { MongoDocument } from "../../infrastructure/mongo-document";

@Entity("wallet-views")
export class WalletView extends MongoDocument {

    @Column()
    address: string;

    @Column()
    blockchain: Blockchains;

    @Column()
    name: SupportedWallets;

    @Column()
    userId: string;
}
