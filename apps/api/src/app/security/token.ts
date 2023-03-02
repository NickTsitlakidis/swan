import { DateTime } from "luxon";

export interface Token {
    tokenValue: string;
    expiresAt: DateTime;
    refreshToken: string;
}
