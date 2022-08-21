import { Type } from "class-transformer";
import { NftMetadataAttributeDto } from "./nft-metadata-attribute-dto";
import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from "class-validator";

export class NftMetadataDto {
    @IsString()
    @IsNotEmpty()
    imageType: string;

    @IsString()
    @IsNotEmpty()
    imageName: string;

    @IsString()
    @IsNotEmpty()
    categoryId: string;

    @IsString()
    @IsNotEmpty()
    s3uri: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    description: string;

    @IsInt()
    @IsPositive()
    resellPercentage: number;

    @IsInt()
    @IsPositive()
    maxSupply: number;

    @IsString()
    @IsNotEmpty()
    chainId: string;

    @IsString()
    @IsNotEmpty()
    walletId: string;

    @IsString()
    @IsOptional()
    collectionId?: string;

    @Type(() => NftMetadataAttributeDto)
    attributes: Array<NftMetadataAttributeDto>;
}
