import { Exclude } from "class-transformer";

export class HttpErrorDto {
    message: string;
    httpStatus: number;
    code: string;

    @Exclude()
    success: string;

    @Exclude()
    stack: string | undefined;

    constructor(message: string, httpStatus: number, code = "000000", success = "false", stack: string | undefined) {
        this.message = message;
        this.httpStatus = httpStatus;
        this.code = code;
        this.success = success;
        this.stack = stack;
    }
}