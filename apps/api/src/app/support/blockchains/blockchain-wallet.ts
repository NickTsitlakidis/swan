import { Entity, Property } from "@mikro-orm/core";
import { MikroDocument } from "../../infrastructure/mikro-document";

@Entity({collection: "blockchain-wallets"})
export class BlockchainWallet extends MikroDocument {

    @Property()
    blockchainId: string;

    @Property()
    walletId: string;
}