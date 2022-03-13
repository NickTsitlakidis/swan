import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class StartAuthenticationDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MinLength(32)
    @MaxLength(44)
    walletAddress: string;
}
