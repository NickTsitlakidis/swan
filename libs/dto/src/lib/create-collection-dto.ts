import { CollectionLinksDto } from "./collection-links-dto";
import { Type } from "class-transformer";
import { IsBoolean, IsDefined, IsObject, IsOptional, IsPositive, IsString } from "class-validator";

export class CreateCollectionDto {
    @IsObject()
    @IsOptional()
    @Type(() => CollectionLinksDto)
    links: CollectionLinksDto;

    @IsString()
    @IsDefined()
    blockchainId: string;

    @IsString()
    @IsDefined()
    name: string;

    @IsString()
    @IsDefined()
    categoryId: string;

    @IsString()
    @IsOptional()
    customUrl: string;

    @IsString()
    @IsOptional()
    description: string;

    @IsBoolean()
    @IsDefined()
    isExplicit: boolean;

    @IsString()
    @IsDefined()
    logoImageUrl: string;

    @IsString()
    @IsDefined()
    bannerImageUrl: string;

    @IsPositive()
    @IsOptional()
    salePercentage: number;

    @IsString()
    @IsDefined()
    paymentToken: string;
}
