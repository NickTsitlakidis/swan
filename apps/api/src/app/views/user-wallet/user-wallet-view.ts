import { MongoDocument } from "../../infrastructure/mongo-document";
import { Entity, Property } from "@mikro-orm/core";

@Entity({ collection: "user-wallet-views" })
export class UserWalletView extends MongoDocument {
    @Property()
    address: string;

    @Property()
    blockchainId: string;

    @Property()
    walletId: string;

    @Property()
    userId: string;

    @Property({ onCreate: () => new Date() })
    createdAt: Date = new Date();
}
