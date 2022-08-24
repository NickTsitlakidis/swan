import { Type } from "class-transformer";
import { BlockchainDto } from "./blockchain-dto";
import { CollectionDto } from "./collection-dto";
import { CategoryDto } from "./category-dto";

export class ProfileNftDto {
    public id?: string;
    public name: string;
    public animationUri?: string;
    public imageUri: string;
    public isListed: boolean;
    public listedPrice?: number;
    public lastSoldPrice?: number;
    public tokenContractAddress?: string;
    public tokenId?: string;

    @Type(() => BlockchainDto)
    public blockchain: BlockchainDto;

    @Type(() => CollectionDto)
    public collection?: CollectionDto;

    @Type(() => CategoryDto)
    public category?: CategoryDto;
}
