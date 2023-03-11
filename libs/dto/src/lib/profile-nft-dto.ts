import { Type } from "class-transformer";
import { BlockchainDto } from "./blockchain-dto";
import { CollectionDto } from "./collection-dto";
import { CategoryDto } from "./category-dto";

export class ProfileNftDto {
    public id?: string;
    //todo check this: where should this get values?
    public name: string;
    public animationUri?: string; //todo this is not set for our nfts
    public imageUri: string;
    public tokenContractAddress?: string;
    public nftAddress?: string;
    public tokenId?: string;
    public walletId: string;
    public metadataUri: string;
    public mintAddress?: string;

    @Type(() => BlockchainDto)
    public blockchain: BlockchainDto;

    @Type(() => CategoryDto)
    public category: CategoryDto;
    public collectionId?: string;
}
