import { IsEnum, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Blockchains } from "./blockchains";
import { SupportedWallets } from "./supported-wallets";

export class StartSignatureAuthenticationDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MinLength(32)
    @MaxLength(44)
    walletAddress: string;

    @ApiProperty({ enum: Blockchains })
    @IsString()
    @IsNotEmpty()
    @IsEnum(Blockchains)
    blockchain: Blockchains;

    @ApiProperty({ enum: SupportedWallets })
    @IsString()
    @IsNotEmpty()
    @IsEnum(SupportedWallets)
    wallet: SupportedWallets;
}
