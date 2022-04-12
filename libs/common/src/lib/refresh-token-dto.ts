import {IsJWT, IsString} from "class-validator";

export class RefreshTokenDto {

    @IsString()
    @IsJWT()
    token: string;

    constructor(token: string) {
        this.token = token;
    }
}
