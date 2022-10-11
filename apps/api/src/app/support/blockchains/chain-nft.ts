import { MetaplexMetadata } from "@nftstorage/metaplex-auth";

export interface ChainNft extends MetaplexMetadata {
    nftAddress?: string;
    tokenContractAddress?: string;
    tokenId?: string;
    categoryId: string;
    metadataUri: string;
}
