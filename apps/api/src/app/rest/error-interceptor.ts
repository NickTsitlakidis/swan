import { CallHandler, ExecutionContext, HttpException, HttpStatus, Injectable, NestInterceptor } from "@nestjs/common";
import { catchError, Observable, throwError } from "rxjs";
import { ApiException } from "../infrastructure/api-exception";
import { HttpErrorDto } from "@swan/dto";
import { isNil } from "@nft-marketplace/utils";

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
                    return throwError(() => {
                        const message =
                            isNil(thrown.getResponse()) ||
                            isNil((thrown.getResponse() as Record<string, unknown>).message)
                                ? thrown.message
                                : (thrown.getResponse() as any).message;
                        return new HttpException(new HttpErrorDto(message, thrown.getStatus()), thrown.getStatus());
                    });
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
