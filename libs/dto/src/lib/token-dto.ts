import { Transform, Type } from "class-transformer";
import { isNil } from "lodash";
import { DateTime } from "luxon";

export class TokenDto {
    tokenValue: string;

    refreshToken?: string | undefined;

    @Type(() => Date)
    @Transform(({ value }) => (isNil(value) ? undefined : DateTime.fromObject(value)), { toClassOnly: true })
    expiresAt: DateTime;

    constructor(tokenValue: string, expiresAt: DateTime, refreshToken?: string) {
        this.tokenValue = tokenValue;
        this.refreshToken = refreshToken;
        this.expiresAt = expiresAt;
    }
}
