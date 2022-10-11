import { Entity, Property } from "@mikro-orm/core";
import { MongoDocument } from "../../infrastructure/mongo-document";
import { EvmContractType } from "./evm-contract-type";

@Entity({ collection: "evm-contracts" })
export class EvmContract extends MongoDocument {
    @Property()
    blockchainId: string;

    @Property()
    type: EvmContractType;

    @Property()
    deploymentAddress: string;

    @Property()
    abi: string;

    @Property()
    isTestNetwork: boolean;

    @Property()
    version: number;

    @Property()
    isActive: boolean;
}
