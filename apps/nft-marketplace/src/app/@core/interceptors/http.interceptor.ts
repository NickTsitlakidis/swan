import { HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { catchError, mergeMap } from "rxjs/operators";

import { environment } from "../../../environments/environment";
import { ClientAuthService } from "../services/authentication/client_auth.service";
import { from, map, Observable, of, switchMap, throwError } from "rxjs";
import { TokenDto } from "@swan/dto";
import { UserFacade } from "../store/user-facade";
import { ComplexState } from "../store/complex-state";
import { isNil } from "lodash";

@Injectable()
export class HttpRequestsInterceptor implements HttpInterceptor {
    public clientRequests = [
        "/support",
        "/user/start-signature-authentication",
        "/user/complete-signature-authentication",
        "/user/refresh-token"
    ];

    public clientLogin = "/client/login";

    constructor(
        private _clientAuthService: ClientAuthService,
        private _userFacade: UserFacade
    ) {}

    intercept(req: HttpRequest<unknown>, next: HttpHandler) {
        const url = req.url;
        const clientData = this._clientAuthService.getClientTokenData();

        const isClientRequest = this.clientRequests.some((requestString) => url.includes(requestString));
        const isUserRequest =
            !req.url.includes("http") &&
            !req.url.includes(this.clientLogin) &&
            this.clientRequests.every((requestString) => !url.includes(requestString));

        if (clientData.tokenValue && isClientRequest) {
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
            toRun = this._userFacade.streamToken().pipe(
                map((tokenState) => {
                    if(isNil(tokenState.state)) {
                        return fullUrlReq
                    } else {
                        return this._addBearerToken(fullUrlReq, tokenState.state.tokenValue);
                    }
                }),
                mergeMap((urlReq) => next.handle(urlReq))
            );
        }

        return toRun.pipe(
            catchError((error) => {
                if (error.status !== 401) {
                    //todo some error handling here perhaps?
                    return throwError(error);
                }

                let withNewToken: Observable<ComplexState<TokenDto>> = throwError(error);

                if (isClientRequest) {
                    withNewToken = this._clientAuthService.getAndStoreClientToken().pipe(
                        map((token) => ComplexState<TokenDto>.fromSuccess(token)),
                        catchError((error) => of(ComplexState<TokenDto>.fromError(error) as ComplexState<TokenDto>))
                    );
                }

                if (isUserRequest) {
                    withNewToken = from(this._userFacade.refreshToken()).pipe(
                        switchMap(() => this._userFacade.streamToken())
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
                        //todo: maybe we should do something here when we have a nice structure for errors
                        return throwError(retriedError);
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
