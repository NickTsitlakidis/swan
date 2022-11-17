import { MetaplexMetadata } from "@nftstorage/metaplex-auth";

export interface ChainNft extends MetaplexMetadata {
    mintAddress?: string;
    nftAddress?: string;
    tokenContractAddress?: string;
    tokenId?: string;
    categoryId: string;
    metadataUri: string;
}
