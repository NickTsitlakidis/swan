import { Entity, Property } from "@mikro-orm/core";
import { MikroDocument } from "../../infrastructure/mikro-document";

@Entity({collection:"wallets"})
export class Wallet extends MikroDocument {
    @Property()
    name: string;

    @Property()
    supportsSignatureAuthentication: boolean;
}
