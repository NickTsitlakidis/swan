import { Entity, Property } from "@mikro-orm/core";
import { MongoDocument } from "../../infrastructure/mongo-document";

@Entity({ collection: "wallets" })
export class Wallet extends MongoDocument {
    @Property()
    name: string;

    @Property()
    supportsSignatureAuthentication: boolean;
}
