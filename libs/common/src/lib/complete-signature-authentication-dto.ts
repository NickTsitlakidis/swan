import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Blockchains } from "./blockchains";

export class CompleteSignatureAuthenticationDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
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
