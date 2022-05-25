import { Column, Entity } from "typeorm";
import { MongoDocument } from "../../infrastructure/mongo-document";

@Entity("blockchain-wallets")
export class BlockchainWallet extends MongoDocument {

    @Column()
    blockchainId: string;

    @Column()
    walletId: string;
}