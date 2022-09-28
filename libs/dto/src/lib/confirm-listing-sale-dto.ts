import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class ConfirmListingSaleDto {
    @IsString()
    @IsNotEmpty()
    listingId: string;

    @IsNumber()
    blockNumber: number;

    @IsNumber()
    chainListingId: number;
}
