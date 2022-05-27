import { Column, CreateDateColumn, Entity } from "typeorm";
import { MongoDocument } from "../../infrastructure/mongo-document";

@Entity("user-wallet-views")
export class UserWalletView extends MongoDocument {
    @Column()
    address: string;

    @Column()
    blockchainId: string;

    @Column()
    walletId: string;

    @Column()
    userId: string;

    @CreateDateColumn()
    createdAt: Date;
}
