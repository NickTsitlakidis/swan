import { IsEthereumAddress, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateListingDto {
    @IsNumber()
    price: number;

    @IsString()
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
    chainTokenId?: string;
}
