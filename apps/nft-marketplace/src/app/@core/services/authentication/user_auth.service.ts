import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {
    CompleteSignatureAuthenticationDto,
    NonceDto,
    RefreshTokenDto,
    StartSignatureAuthenticationDto,
    TokenDto
} from "@nft-marketplace/common";
import { LocalStorageService } from "ngx-webstorage";
import { Observable, switchMap, throwError } from "rxjs";
import { plainToClass } from "class-transformer";
import { map, tap } from "rxjs/operators";
import moment from "moment";
import { WalletRegistryService } from "../chains/wallet-registry.service";
import { isNil } from "lodash";
import { AuthenticationModule } from "./authentication.module";

@Injectable({
    providedIn: AuthenticationModule
})
export class UserAuthService {
    constructor(
        private _httpClient: HttpClient,
        private _walletRegistry: WalletRegistryService,
        private _lcStorage: LocalStorageService
    ) {}

    public getUserTokenData(): TokenDto {
        return new TokenDto(
            this._lcStorage.retrieve("userTokenValue"),
            moment(this._lcStorage.retrieve("userExpiresAt")),
            this._lcStorage.retrieve("userRefreshToken")
        );
    }

    public setPublicKey(address: string) {
        if (address) {
            this._lcStorage.store("publicKey", address);
        }
    }

    public getPublicKey(): string {
        return this._lcStorage.retrieve("publicKey");
    }

    public refreshToken(): Observable<TokenDto> {
        const storedRefreshToken = this._lcStorage.retrieve("userRefreshToken");
        return this._httpClient.post("/user/refresh-token", new RefreshTokenDto(storedRefreshToken)).pipe(
            map((httpResult) => plainToClass(TokenDto, httpResult)),
            tap((dto) => this._storeUserData(dto))
        );
    }

    public authenticateWithSignature(body: StartSignatureAuthenticationDto) {
        const walletService = this._walletRegistry.getWalletService(body.walletId);
        if (isNil(walletService)) {
            return throwError(() => "Unable to match wallet with service");
        }

        return this._httpClient.post<NonceDto>("/user/start-signature-authentication", body).pipe(
            switchMap((nonce) => {
                return walletService.signMessage(nonce.nonce);
            }),
            switchMap((signature) => {
                if (isNil(signature)) {
                    return throwError(() => "Signature authentication stopped");
                }

                const completeBody = new CompleteSignatureAuthenticationDto();
                completeBody.signature = signature;
                completeBody.blockchainId = body.blockchainId;
                completeBody.walletAddress = body.walletAddress;
                return this._httpClient.post("/user/complete-signature-authentication", completeBody);
            }),
            map((httpResult) => plainToClass(TokenDto, httpResult)),
            tap((dto) => this._storeUserData(dto))
        );
    }

    private _storeUserData(userData: TokenDto) {
        this._lcStorage.store("userTokenValue", userData.tokenValue);
        this._lcStorage.store("userExpiresAt", userData.expiresAt.toISOString());
        this._lcStorage.store("userRefreshToken", userData.refreshToken);
    }
}
