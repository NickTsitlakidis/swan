import { CallHandler, ExecutionContext, HttpException, HttpStatus, Injectable, NestInterceptor } from "@nestjs/common";
import { catchError, Observable, throwError } from "rxjs";
import { ApiException } from "../infrastructure/api-exception";
import { HttpErrorDto } from "@swan/dto";

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler<unknown>): Observable<unknown> {
        return next.handle().pipe(
            catchError((thrown) => {
                if (thrown instanceof ApiException) {
                    return throwError(
                        () =>
                            new HttpException(
                                new HttpErrorDto(thrown.message, thrown.httpStatus, thrown.code),
                                thrown.httpStatus
                            )
                    );
                }

                if (thrown instanceof HttpException) {
                    return throwError(
                        () =>
                            new HttpException(new HttpErrorDto(thrown.message, thrown.getStatus()), thrown.getStatus())
                    );
                }

                return throwError(
                    () =>
                        new HttpException(
                            new HttpErrorDto(thrown.message, HttpStatus.INTERNAL_SERVER_ERROR),
                            HttpStatus.INTERNAL_SERVER_ERROR
                        )
                );
            })
        );
    }
}
