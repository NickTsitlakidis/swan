import { HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { catchError, mergeMap, tap } from "rxjs/operators";

import { environment } from "../../../environments/environment";
import { ClientAuthService } from "../services/authentication/client_auth.service";
import { UserAuthService } from "../services/authentication/user_auth.service";
import { Observable, throwError } from "rxjs";
import { TokenDto } from "@nft-marketplace/common";

@Injectable()
export class HttpRequestsInterceptor implements HttpInterceptor {
    public clientRequests = [
        "/support",
        "/user/start-signature-authentication",
        "/user/complete-signature-authentication",
        "/user/refresh-token"
    ];

    constructor(private _clientAuthService: ClientAuthService, private _userAuthService: UserAuthService) {}

    intercept(req: HttpRequest<unknown>, next: HttpHandler) {
        const url = req.url;
        const clientData = this._clientAuthService.getClientTokenData();
        const userData = this._userAuthService.getUserTokenData();

        const isClientRequest = this.clientRequests.some((requestString) => url.includes(requestString));
        const isUserRequest = !req.url.includes("http") && this.clientRequests.every((requestString) => !url.includes(requestString));

        if (clientData.tokenValue && isClientRequest) {
            req = this._addBearerToken(req, clientData.tokenValue);
        }

        if (userData.tokenValue && isUserRequest) {
            req = this._addBearerToken(req, userData.tokenValue);
        }

        let fullUrlReq: HttpRequest<unknown> = req.clone();

        if(!fullUrlReq.url.includes("http")) {
            fullUrlReq = req.clone({
                url: environment.serverUrl + url
            });
        }

        const retryable = fullUrlReq.clone();
        return next.handle(fullUrlReq).pipe(
            tap({
                // Succeeds when there is a response; ignore other events
                /* next: (event) => (ok = event instanceof HttpResponse ? "succeeded" : "") */
                // Operation failed; error is an HttpErrorResponse
                /* error: (error) => () */
            }),
            catchError((error) => {
                if (error.status !== 401) {
                    //todo some error handling here perhaps?
                    return throwError(error);
                }

                let withNewToken: Observable<TokenDto> = throwError(error);

                if (isClientRequest) {
                    withNewToken = this._clientAuthService.getAndStoreClientToken();
                }

                if (isUserRequest) {
                    withNewToken = this._userAuthService.refreshToken();
                }

                return withNewToken.pipe(
                    mergeMap((token) => {
                        return next.handle(this._addBearerToken(retryable, token.tokenValue));
                    }),
                    catchError((retriedError) => {
                        //todo: maybe we should do something here when we have a nice structure for errors
                        return throwError(retriedError);
                    })
                );
            })
            /* // Log when response observable either completes or errors
            finalize(() => {
                const elapsed = Date.now() - started;
                const msg = `${req.method} "${req.urlWithParams}"
             ${ok} in ${elapsed} ms.`;
                this.messenger.add(msg);
            }) */
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
