import moment, { Moment } from "moment";
import { Transform, Type } from "class-transformer";
import { isNil } from "lodash";

export class TokenDto {
    tokenValue: string;

    refreshToken?: string | undefined;

    @Type(() => Date)
    @Transform(({ value }) => (isNil(value) ? undefined : moment(value)), { toClassOnly: true })
    expiresAt: Moment;

    constructor(tokenValue: string, expiresAt: Moment, refreshToken?: string) {
        this.tokenValue = tokenValue;
        this.refreshToken = refreshToken;
        this.expiresAt = expiresAt;
    }
}
