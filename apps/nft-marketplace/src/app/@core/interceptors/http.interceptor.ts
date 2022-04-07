import { HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { tap } from "rxjs/operators";

import { environment } from "../../../environments/environment";
import { ClientAuthService } from "../services/authentication/client_auth.service";
import { UserAuthService } from "../services/authentication/user_auth.service";

@Injectable()
export class HttpRequestsInterceptor implements HttpInterceptor {
    public clientRequests = [
        "/system",
        "/user/start-signature-authentication",
        "/user/complete-signature-authentication"
    ];
    public clientLogin = "/client/login";
    public userRequests = ["/collections"];

    constructor(private _clientAuthService: ClientAuthService, private _userAuthService: UserAuthService) {}

    intercept(req: HttpRequest<unknown>, next: HttpHandler) {
        const url = req.url;

        const clientData = this._clientAuthService.getClientTokenData();
        const userData = this._userAuthService.getUserTokenData();
        if (clientData.tokenValue && this.clientRequests.some((requestString) => url.includes(requestString))) {
            req = this._addBearerToken(req, clientData.tokenValue);
        }

        if (userData.tokenValue && this.userRequests.some((requestString) => url.includes(requestString))) {
            req = this._addBearerToken(req, userData.tokenValue);
        }

        const httpsReq: HttpRequest<unknown> = req.clone({
            url: environment.serverUrl + url
        });

        // extend server response observable with logging
        return next.handle(httpsReq).pipe(
            tap({
                // Succeeds when there is a response; ignore other events
                /* next: (event) => (ok = event instanceof HttpResponse ? "succeeded" : "") */
                // Operation failed; error is an HttpErrorResponse
                /* error: (error) => () */
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
