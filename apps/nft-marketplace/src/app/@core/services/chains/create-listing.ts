import { BlockchainDto } from "@swan/dto";

export interface CreateListing {
    price: number;
    tokenContractAddress?: string;
    tokenId?: number;
    blockchain: BlockchainDto;
    nftAddress?: string | undefined;
}
