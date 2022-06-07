import { IsNotEmpty, IsString } from "class-validator";

export class CompleteSignatureAuthenticationDto {
    @IsString()
    @IsNotEmpty()
    address: string;

    @IsString()
    @IsNotEmpty()
    signature: string;

    @IsString()
    @IsNotEmpty()
    blockchainId: string;
}
