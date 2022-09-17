import { Type } from "class-transformer";
import { BlockchainDto } from "./blockchain-dto";
import { CollectionDto } from "./collection-dto";
import { CategoryDto } from "./category-dto";

export class ProfileNftDto {
    public id?: string;
    //todo check this: where should this get values?
    public name: string;
    public animationUri?: string;
    public imageUri: string;
    public tokenContractAddress?: string;
    public nftAddress?: string;
    public tokenId?: string;
    public walletId: string;

    @Type(() => BlockchainDto)
    public blockchain: BlockchainDto;

    @Type(() => CollectionDto)
    public collection?: CollectionDto;

    @Type(() => CategoryDto)
    public category: CategoryDto;
}
