import { HttpStatus } from "@nestjs/common";
import { isNil } from "lodash";

export class ApiException extends Error {
    private readonly _httpStatus: HttpStatus;
    private readonly _code: string;

    constructor(message: string, isExpected = true, code = "000000", httpStatus?: HttpStatus) {
        super(message);
        this._code = code;
        if (isNil(httpStatus)) {
            this._httpStatus = isExpected ? HttpStatus.BAD_REQUEST : HttpStatus.INTERNAL_SERVER_ERROR;
        } else {
            this._httpStatus = httpStatus;
        }
    }

    get httpStatus(): HttpStatus {
        return this._httpStatus;
    }

    get code(): string {
        return this._code;
    }
}
