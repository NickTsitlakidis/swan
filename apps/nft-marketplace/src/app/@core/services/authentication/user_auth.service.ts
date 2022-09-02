import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { CompleteSignatureAuthenticationDto, NonceDto, StartSignatureAuthenticationDto } from "@swan/dto";
import { LocalStorageService } from "ngx-webstorage";
import { Observable, of, switchMap, throwError, zip } from "rxjs";
import { WalletRegistryService } from "../chains/wallet-registry.service";
import { isNil } from "lodash";

@Injectable({
    providedIn: "root"
})
export class UserAuthService {
    constructor(
        private _httpClient: HttpClient,
        private _walletRegistry: WalletRegistryService,
        private _lcStorage: LocalStorageService
    ) {}

    public addUserWallet(body: StartSignatureAuthenticationDto): Observable<object> {
        return this._walletRegistry.getWalletService(body.walletId).pipe(
            switchMap((walletService) => {
                if (isNil(walletService)) {
                    return throwError(() => "Unable to match wallet with service");
                }
                return zip(of(walletService), this._httpClient.post<NonceDto>("/user/start-wallet-addition", body));
            }),

            switchMap((service) => {
                const walletService = service[0];
                const nonce = service[1];
                return walletService.signMessage(nonce.nonce);
            }),
            switchMap((signature) => {
                if (isNil(signature)) {
                    return throwError(() => "Signature authentication stopped");
                }

                const completeBody = new CompleteSignatureAuthenticationDto();
                completeBody.signature = signature;
                completeBody.blockchainId = body.blockchainId;
                completeBody.address = body.address;
                return this._httpClient.post("/user/complete-wallet-addition", completeBody);
            })
        );
    }
}
