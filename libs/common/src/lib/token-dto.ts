import { Moment } from "moment";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class TokenDto {
    @ApiProperty()
    tokenValue: string;

    @ApiProperty()
    refreshToken: string | undefined;

    @ApiProperty({ type: Date })
    @Type(() => Date)
    expiresAt: Moment;

    constructor(tokenValue: string, expiresAt: Moment, refreshToken?: string) {
        this.tokenValue = tokenValue;
        this.refreshToken = refreshToken;
        this.expiresAt = expiresAt;
    }
}
