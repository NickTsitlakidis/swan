import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class StartAuthenticationDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(32)
    @MaxLength(44)
    walletAddress: string;
}
