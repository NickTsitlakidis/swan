export class HttpErrorDto {
    constructor(public message: string, public httpStatus: number, public code: string = "000000") {}
}
