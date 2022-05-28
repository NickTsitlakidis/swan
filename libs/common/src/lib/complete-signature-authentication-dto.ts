import { IsNotEmpty, IsString } from "class-validator";

export class CompleteSignatureAuthenticationDto {
    @IsString()
    @IsNotEmpty()
    walletAddress: string;

    @IsString()
    @IsNotEmpty()
    signature: string;

    @IsString()
    @IsNotEmpty()
    blockchainId: string;
}
