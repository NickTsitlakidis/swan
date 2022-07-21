import { Type } from "class-transformer";
import { BlockchainDto } from "./blockchain-dto";
import { CollectionDto } from "./collection-dto";

export class ProfileNftDto {
    public id?: string;
    public name: string;
    public fileUri: string;
    public fileType: string;
    public isListed: boolean;
    public listedPrice?: number;
    public lastSoldPrice?: number;

    @Type(() => BlockchainDto)
    public blockchain: BlockchainDto;

    @Type(() => CollectionDto)
    public collection: CollectionDto;
}
