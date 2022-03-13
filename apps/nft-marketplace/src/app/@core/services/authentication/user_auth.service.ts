import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { CompleteAuthenticationDto, NonceDto, StartAuthenticationDto, TokenDto } from "@nft-marketplace/common";
import { LocalStorageService } from "ngx-webstorage";

@Injectable({
    providedIn: "root"
})
export class UserAuthService {
    storeUserData(userData: TokenDto) {
        this._lcStorage.store("userTokenValue", userData.tokenValue);
        this._lcStorage.store("userExpiresAt", userData.expiresAt);
        this._lcStorage.store("userRefreshToken", userData.refreshToken);
    }
    constructor(private httpClient: HttpClient, private _lcStorage: LocalStorageService) {}

    public getUserTokenData(): TokenDto {
        return {
            tokenValue: this._lcStorage.retrieve("userTokenValue"),
            refreshToken: this._lcStorage.retrieve("userRefreshToken"),
            expiresAt: this._lcStorage.retrieve("userExpiresAt")
        };
    }

    public completeAuthentication(body: CompleteAuthenticationDto) {
        return this.httpClient.post<TokenDto>("/user/complete-authentication", body);
    }

    public getNonce(body: StartAuthenticationDto) {
        return this.httpClient.post<NonceDto>("/user/start-authentication", body);
    }
}
