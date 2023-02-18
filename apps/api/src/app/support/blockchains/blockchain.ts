import { SignatureTypes } from "./signature-types";
import { MongoDocument } from "../../infrastructure/mongo-document";
import { Entity, Property } from "@mikro-orm/core";

@Entity({ collection: "blockchains" })
export class Blockchain extends MongoDocument {
    @Property()
    name: string;

    @Property()
    mainTokenName: string;

    @Property()
    mainTokenSymbol: string;

    @Property()
    isTestNetwork: boolean;

    @Property()
    enabled: boolean;

    @Property()
    rpcUrl: string;

    @Property()
    chainIdHex: string;

    @Property()
    chainIdDecimal: number;

    @Property()
    scanSiteUrl: string;

    @Property()
    signatureType: SignatureTypes;
}
