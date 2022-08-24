import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class ActivateListingDto {
    @IsString()
    @IsNotEmpty()
    listingId: string;

    @IsNumber()
    blockNumber: number;

    @IsNumber()
    chainListingId: number;
}
