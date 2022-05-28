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
import { Observable } from "rxjs";
import { plainToClass } from "class-transformer";
import { map, tap } from "rxjs/operators";
import moment from "moment";

@Injectable({
    providedIn: "root"
})
export class UserAuthService {
    constructor(private httpClient: HttpClient, private _lcStorage: LocalStorageService) {}

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
        return this.httpClient.post("/user/refresh-token", new RefreshTokenDto(storedRefreshToken)).pipe(
            map((httpResult) => plainToClass(TokenDto, httpResult)),
            tap((dto) => this._storeUserData(dto))
        );
    }

    public completeAuthentication(body: CompleteSignatureAuthenticationDto) {
        return this.httpClient.post("/user/complete-signature-authentication", body).pipe(
            map((httpResult) => plainToClass(TokenDto, httpResult)),
            tap((dto) => this._storeUserData(dto))
        );
    }

    public getNonce(body: StartSignatureAuthenticationDto) {
        return this.httpClient.post<NonceDto>("/user/start-signature-authentication", body);
    }

    private _storeUserData(userData: TokenDto) {
        this._lcStorage.store("userTokenValue", userData.tokenValue);
        this._lcStorage.store("userExpiresAt", userData.expiresAt.toISOString());
        this._lcStorage.store("userRefreshToken", userData.refreshToken);
    }
}
