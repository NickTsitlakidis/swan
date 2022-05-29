import { MetadataAttribute } from "./metadata-attribute";
import { Collection } from "./collection";

export interface CreateNft {
    metadataUri: string;
    collection: Collection;
    name?: string;
    symbol?: string;
    resellPercentage?: number;
    maxSupply?: number;
    metadata: Array<MetadataAttribute>;
}

export interface MintTransaction {
    transactionId: string;
    tokenAddress: string;
    metadataUri: string;
    imageUri: string;
}