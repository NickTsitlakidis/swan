import { MongoDocument } from "../../infrastructure/mongo-document";
import { Entity, Property } from "@mikro-orm/core";

@Entity({ collection: "evm-nft-contracts" })
export class EvmNftContract extends MongoDocument {
    @Property()
    address: string;

    @Property()
    blockchainId: string;
}
