import { SignatureTypes } from "./signature-types";
import { MikroDocument } from "../../infrastructure/mikro-document";
import { Entity, Property } from "@mikro-orm/core";

@Entity({collection: "blockchains"})
export class Blockchain extends MikroDocument {
    @Property()
    name: string;

    @Property()
    mainTokenName: string;

    @Property()
    mainTokenSymbol: string;

    @Property()
    isTestNetwork: boolean;

    @Property()
    rpcUrl: string;

    @Property()
    chainId: string;

    @Property()
    scanSiteUrl: string;

    @Property()
    signatureType: SignatureTypes;
}
