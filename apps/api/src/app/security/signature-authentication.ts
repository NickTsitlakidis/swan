import { Entity, Property } from "@mikro-orm/core";
import { MikroDocument } from "../infrastructure/mikro-document";

@Entity({collection: "signature-authentications"})
export class SignatureAuthentication extends MikroDocument {
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

    @Property({onCreate: () => new Date()})
    createdAt: Date = new Date();
}
