import { IsNotEmpty, IsString } from "class-validator";

export class ConnectDto {
    @IsString()
    @IsNotEmpty()
    walletAddress: string;
}
