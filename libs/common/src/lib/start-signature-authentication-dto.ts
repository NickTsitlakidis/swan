import { IsEnum, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

import { Blockchains } from "./blockchains";
import { SupportedWallets } from "./supported-wallets";

export class StartSignatureAuthenticationDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(32)
    @MaxLength(44)
    walletAddress: string;

    @IsString()
    @IsNotEmpty()
    @IsEnum(Blockchains)
    blockchain: Blockchains;

    @IsString()
    @IsNotEmpty()
    @IsEnum(SupportedWallets)
    wallet: SupportedWallets;
}
