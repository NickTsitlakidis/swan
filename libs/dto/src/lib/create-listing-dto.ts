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
    tokenContractAddress?: string;

    @IsString()
    @IsNotEmpty()
    nftAddress?: string;

    @IsString()
    @IsNotEmpty()
    chainTokenId?: string;
}
