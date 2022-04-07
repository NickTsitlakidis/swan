import { Moment } from "moment";
import { Type } from "class-transformer";

export class TokenDto {
    tokenValue: string;

    refreshToken?: string | undefined;

    @Type(() => Date)
    expiresAt: Moment;

    constructor(tokenValue: string, expiresAt: Moment, refreshToken?: string) {
        this.tokenValue = tokenValue;
        this.refreshToken = refreshToken;
        this.expiresAt = expiresAt;
    }
}
