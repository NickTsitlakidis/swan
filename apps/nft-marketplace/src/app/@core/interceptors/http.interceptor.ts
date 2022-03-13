import { HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { tap } from "rxjs/operators";

import { environment } from "../../../environments/environment";
import { ClientAuthService } from "../services/authentication/client_auth.service";

@Injectable()
export class HttpRequestsInterceptor implements HttpInterceptor {
    constructor(private _clientAuthService: ClientAuthService) {}

    intercept(req: HttpRequest<unknown>, next: HttpHandler) {
        // const started = Date.now();
        const url = req.url;

        const clientData = this._clientAuthService.getClientTokenData();
        if (clientData.tokenValue && url.indexOf("/client/login") === -1) {
            req = this._addBearerToken(req, clientData.tokenValue);
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
