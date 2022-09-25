import { BlockchainDto, EvmContractDto } from "@swan/dto";

export interface CreateListing {
    price: number;
    tokenContractAddress?: string;
    tokenId?: number;
    blockchain: BlockchainDto;
    marketplaceContract?: EvmContractDto;
}
