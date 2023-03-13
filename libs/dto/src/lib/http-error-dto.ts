export class HttpErrorDto {
    constructor(
        public message: string,
        public httpStatus: number,
        public code: string = "000000",
        public success: string = "false",
        public stack: string | undefined
    ) {}
}
