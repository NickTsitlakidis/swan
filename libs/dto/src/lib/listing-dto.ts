import { IsString, IsOptional, IsNotEmpty, IsNumber } from "class-validator";

export class ListingDto {
    id: string;

    @IsNotEmpty()
    @IsString()
    blockchainId: string;

    @IsNotEmpty()
    @IsString()
    categoryId: string;

    @IsNotEmpty()
    @IsString()
    sellerAddress: string;

    @IsNotEmpty()
    @IsNumber()
    price: number;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    tokenContractAddress?: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    nftAddress?: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    chainTokenId?: string;
}
