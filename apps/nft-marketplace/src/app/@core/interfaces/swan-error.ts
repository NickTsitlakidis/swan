// export interface SwanError {
//     message: string;
//     code?: string;
//     status?: string;
// }

export class SwanError {
    constructor(public message: string, public code: number = 100, public status: string = "") {

    }
}