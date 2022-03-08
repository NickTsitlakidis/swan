import { IsEnum, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { SupportedWallets } from "./supported-wallets";

export class CompleteAuthenticationDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(32)
    @MaxLength(44)
    walletAddress: string;

    @IsString()
    @IsNotEmpty()
    signature: string;

    @IsString()
    @IsNotEmpty()
    @IsEnum(SupportedWallets)
    walletType: SupportedWallets;
}
