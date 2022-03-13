import { IsEnum, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { SupportedWallets } from "./supported-wallets";
import { ApiProperty } from "@nestjs/swagger";

export class CompleteAuthenticationDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MinLength(32)
    @MaxLength(44)
    walletAddress: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    signature: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @IsEnum(SupportedWallets)
    walletType: SupportedWallets;
}
