import {
    CallHandler,
    ExecutionContext,
    HttpException,
    HttpStatus,
    Injectable,
    Logger,
    NestInterceptor
} from "@nestjs/common";
import { catchError, Observable, throwError } from "rxjs";
import { ApiException } from "../infrastructure/api-exception";
import { HttpErrorDto } from "@swan/dto";
import { isNil } from "lodash";
import { getLogger } from "../infrastructure/logging";

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
    private logger: Logger;

    constructor() {
        this.logger = getLogger(ErrorInterceptor);
    }

    intercept(context: ExecutionContext, next: CallHandler<unknown>): Observable<unknown> {
        return next.handle().pipe(
            catchError((thrown) => {
                if (thrown instanceof ApiException) {
                    return throwError(() => {
                        this.logger.error(
                            new HttpErrorDto(
                                thrown.message,
                                thrown.httpStatus as HttpStatus,
                                thrown.code,
                                undefined,
                                thrown.stack
                            ),
                            thrown.httpStatus
                        );
                        return new HttpException(
                            new HttpErrorDto(
                                thrown.message,
                                thrown.httpStatus as HttpStatus,
                                thrown.code,
                                undefined,
                                thrown.stack
                            ),
                            thrown.httpStatus as HttpStatus
                        );
                    });
                }

                if (thrown instanceof HttpException) {
                    return throwError(() => {
                        const message =
                            isNil(thrown.getResponse()) ||
                            isNil((thrown.getResponse() as Record<string, unknown>).message)
                                ? thrown.message
                                : (thrown.getResponse() as any).message;
                        this.logger.error(
                            new HttpErrorDto(message, thrown.getStatus(), undefined, undefined, thrown.stack),
                            thrown.getStatus()
                        );
                        return new HttpException(
                            new HttpErrorDto(message, thrown.getStatus(), undefined, undefined, thrown.stack),
                            thrown.getStatus()
                        );
                    });
                }

                return throwError(() => {
                    this.logger.error(
                        new HttpErrorDto(
                            thrown.message,
                            HttpStatus.INTERNAL_SERVER_ERROR,
                            undefined,
                            undefined,
                            thrown.stack
                        ),
                        HttpStatus.INTERNAL_SERVER_ERROR
                    );
                    return new HttpException(
                        new HttpErrorDto(
                            thrown.message,
                            HttpStatus.INTERNAL_SERVER_ERROR,
                            undefined,
                            undefined,
                            thrown.stack
                        ),
                        HttpStatus.INTERNAL_SERVER_ERROR
                    );
                });
            })
        );
    }
}
