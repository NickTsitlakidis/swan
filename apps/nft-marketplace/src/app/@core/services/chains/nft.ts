import { Collection } from "../collections/collection";

export interface CreateNft {
    file: File;
    metadataUri: string;
    collection?: Collection;
    name: string;
    symbol?: string;
    resellPercentage?: number;
    maxSupply?: number;
    metadata: Array<MetadataAttribute>;
}

export interface MintTransaction {
    transactionId: string;
    tokenAddress: string;
    tokenId?: string;
    metadataUri: string;
    imageUri?: string;
}

export interface ErrorMintTransaction {
    success: boolean;
    message: string;
}

export interface MetadataAttribute {
    traitType: string;
    value: string;
    displayType: string;
}
