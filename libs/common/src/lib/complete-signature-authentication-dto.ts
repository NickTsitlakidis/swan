import { IsNotEmpty, IsString } from "class-validator";

import { Blockchains } from "./blockchains";

export class CompleteSignatureAuthenticationDto {
    @IsString()
    @IsNotEmpty()
    walletAddress: string;

    @IsString()
    @IsNotEmpty()
    signature: string;

    @IsString()
    @IsNotEmpty()
    blockchain: Blockchains;
}
