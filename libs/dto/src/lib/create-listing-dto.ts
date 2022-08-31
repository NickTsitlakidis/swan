import { IsEthereumAddress, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateListingDto {
    @IsNumber()
    price: number;

    @IsString()
    @IsOptional()
    nftId?: string;

    @IsString()
    @IsNotEmpty()
    categoryId: string;

    @IsString()
    @IsNotEmpty()
    blockchainId: string;

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
