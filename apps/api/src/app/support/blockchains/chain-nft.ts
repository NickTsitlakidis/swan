import { MetaplexMetadata } from "@nftstorage/metaplex-auth";

export interface ChainNft extends MetaplexMetadata {
    tokenContractAddress?: string;
    tokenId?: string;
    categoryId: string;
}
