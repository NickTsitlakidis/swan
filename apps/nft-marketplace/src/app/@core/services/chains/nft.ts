import { NftMetadataAttributeDto } from "@nft-marketplace/common";
import { Collection } from "../collections/collection";

export interface CreateNft {
    id: string;
    metadataUri: string;
    collection?: Collection;
    name: string;
    symbol?: string;
    resellPercentage?: number;
    maxSupply?: number;
    metadata: Array<NftMetadataAttributeDto>;
}

export interface ErrorMintTransaction {
    success: boolean;
    message: string;
}
