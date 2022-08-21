import { IsNotEmpty, IsString } from "class-validator";

export class SubmitListingDto {

    @IsString()
    @IsNotEmpty()
    listingId: string;

    @IsString()
    @IsNotEmpty()
    chainTransactionId: string;
}
