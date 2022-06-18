import { Entity, Property } from "@mikro-orm/core";
import { MongoDocument } from "../infrastructure/mongo-document";

@Entity({ collection: "signature-authentications" })
export class SignatureAuthentication extends MongoDocument {
    @Property()
    address: string;

    @Property()
    message: string;

    @Property()
    blockchainId: string;

    @Property()
    walletId: string;

    @Property()
    userId: string;

    @Property()
    isEvm: boolean;

    @Property({ onCreate: () => new Date() })
    createdAt: Date = new Date();
}
