import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Blockchains } from "./blockchains";

export class CompleteSignatureAuthenticationDto {
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

    @ApiProperty({ enum: Blockchains })
    @IsString()
    @IsNotEmpty()
    blockchain: Blockchains;
}
