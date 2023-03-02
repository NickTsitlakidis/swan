import { Transform, Type } from "class-transformer";
import { DateTime } from "luxon";
import { isNil } from "@nft-marketplace/utils";

export class TokenDto {
    tokenValue: string;

    @Type(() => Date)
    @Transform(({ value }) => (isNil(value) ? undefined : DateTime.fromObject(value)), { toClassOnly: true })
    expiresAt: DateTime;

    constructor(tokenValue: string, expiresAt: DateTime) {
        this.tokenValue = tokenValue;
        this.expiresAt = expiresAt;
    }
}
