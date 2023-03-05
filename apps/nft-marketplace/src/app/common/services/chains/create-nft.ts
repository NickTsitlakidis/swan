import { BlockchainDto, EvmContractDto, NftMetadataAttributeDto } from "@swan/dto";
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
    blockchain: BlockchainDto;
    contract?: EvmContractDto;
}
