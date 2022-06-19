import { Entity, Property } from "@mikro-orm/core";
import { MongoDocument } from "../../infrastructure/mongo-document";

@Entity({ collection: "blockchain-wallets" })
export class BlockchainWallet extends MongoDocument {
    @Property()
    blockchainId: string;

    @Property()
    walletId: string;
}
