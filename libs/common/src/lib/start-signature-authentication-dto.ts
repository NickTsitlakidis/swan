import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class StartSignatureAuthenticationDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(32)
    @MaxLength(44)
    address: string;

    @IsString()
    @IsNotEmpty()
    blockchainId: string;

    @IsString()
    @IsNotEmpty()
    walletId: string;
}
