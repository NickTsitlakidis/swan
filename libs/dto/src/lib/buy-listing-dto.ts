import { IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class BuyListingDto {
    @IsString()
    @IsNotEmpty()
    listingId: string;

    @IsString()
    @IsNotEmpty()
    chainTransactionHash: string;

    @IsInt()
    @IsNotEmpty()
    @IsOptional()
    blockNumber: number;
}