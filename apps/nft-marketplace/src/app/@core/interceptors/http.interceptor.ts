import { HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, mergeMap, switchMap } from "rxjs/operators";
import { environment } from "../../../environments/environment";
import { from, map, Observable, throwError } from "rxjs";
import { HttpErrorDto, TokenDto } from "@swan/dto";
import { ComplexState } from "../store/complex-state";
import { plainToClass } from "class-transformer";
import { NotificationsService } from "../../@theme/services/notifications.service";
import { SKIP_ERROR_TOAST } from "./http-context-tokens";
import { UserStore } from "../store/user-store";
import { when } from "mobx";
import { ClientStore } from "../store/client-store";

@Injectable()
export class HttpRequestsInterceptor implements HttpInterceptor {
    public clientRequests = [
        "/support",
        "/user/start-signature-authentication",
        "/user/complete-signature-authentication",
        "/user/refresh-token",
        "/listings/get-active-listings"
    ];

    public clientLogin = "/client/login";

    constructor(
        private _userStore: UserStore,
        private _clientStore: ClientStore,
        private _notificationsService: NotificationsService
    ) {}

    intercept(req: HttpRequest<unknown>, next: HttpHandler) {
        const url = req.url;
        const clientData = this._clientStore.clientToken;

        const isClientRequest = this.clientRequests.some((requestString) => url.includes(requestString));
        const isUserRequest =
            !req.url.includes("http") &&
            !req.url.includes(this.clientLogin) &&
            this.clientRequests.every((requestString) => !url.includes(requestString));

        if (clientData && isClientRequest) {
            req = this._addBearerToken(req, clientData.tokenValue);
        }

        let fullUrlReq: HttpRequest<unknown> = req.clone();

        if (!fullUrlReq.url.includes("http")) {
            fullUrlReq = req.clone({
                url: environment.serverUrl + url
            });
        }

        const retryable = fullUrlReq.clone();

        let toRun = next.handle(fullUrlReq);

        if (isUserRequest) {
            if (this._userStore.token) {
                const userToken = this._userStore.token;
                toRun = next.handle(this._addBearerToken(fullUrlReq, userToken.tokenValue));
            } else {
                this._userStore.refreshToken();
                toRun = from(when(() => !this._userStore.tokenState.isLoading, { timeout: 5000 })).pipe(
                    switchMap(() => {
                        const userToken = this._userStore.token;
                        if (userToken) {
                            return next.handle(this._addBearerToken(fullUrlReq, userToken.tokenValue));
                        }
                        return throwError(() => "Unable to get new token");
                    })
                );
            }
        }

        return toRun.pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status !== 401) {
                    const mappedError = plainToClass(HttpErrorDto, error.error as unknown);
                    if (!req.context.get(SKIP_ERROR_TOAST)) {
                        this._notificationsService.displayHttpError(mappedError);
                    }
                    return throwError(() => mappedError);
                }

                let withNewToken: Observable<ComplexState<TokenDto>> = throwError(() => error);

                if (isClientRequest) {
                    this._clientStore.fetchToken();
                    withNewToken = from(when(() => !this._clientStore.tokenState.isLoading, { timeout: 5000 })).pipe(
                        map(() => this._clientStore.tokenState)
                    );
                }

                if (isUserRequest) {
                    this._userStore.refreshToken();
                    withNewToken = from(when(() => !this._userStore.tokenState.isLoading, { timeout: 5000 })).pipe(
                        map(() => this._userStore.tokenState)
                    );
                }

                return withNewToken.pipe(
                    mergeMap((token) => {
                        if (token.error) {
                            return throwError(() => token.error);
                        } else {
                            return next.handle(this._addBearerToken(retryable, token.state.tokenValue));
                        }
                    }),
                    catchError((retriedError) => {
                        const mappedError = plainToClass(HttpErrorDto, retriedError.error as unknown);
                        if (!req.context.get(SKIP_ERROR_TOAST)) {
                            this._notificationsService.displayHttpError(mappedError);
                        }
                        return throwError(() => mappedError);
                    })
                );
            })
        );
    }

    private _addBearerToken(request: HttpRequest<unknown>, tokenValue: string) {
        return request.clone({
            setHeaders: {
                Authorization: `Bearer ${tokenValue}`
            }
        });
    }
}
