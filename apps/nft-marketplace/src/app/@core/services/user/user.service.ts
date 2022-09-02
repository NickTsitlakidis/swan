import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import {
    CompleteSignatureAuthenticationDto,
    NonceDto,
    ProfileNftDto,
    RefreshTokenDto,
    StartSignatureAuthenticationDto,
    TokenDto,
    UserDto,
    UserWalletDto
} from "@swan/dto";
import { map } from "rxjs/operators";
import { plainToClass, plainToInstance } from "class-transformer";

@Injectable({
    providedIn: "root"
})
export class UserService {
    public wallets: UserWalletDto[] = [];

    constructor(private readonly _httpClient: HttpClient) {}

    startSignatureAuthentication(body: StartSignatureAuthenticationDto): Observable<NonceDto> {
        return this._httpClient
            .post("/user/start-signature-authentication", body)
            .pipe(map((httpResult) => plainToClass(NonceDto, httpResult)));
    }

    completeSignatureAuthentication(completeBody: CompleteSignatureAuthenticationDto): Observable<TokenDto> {
        return this._httpClient
            .post("/user/complete-signature-authentication", completeBody)
            .pipe(map((httpResult) => plainToClass(TokenDto, httpResult)));
    }

    getUser(): Observable<UserDto> {
        return this._httpClient.get("/user").pipe(map((httpResult) => plainToClass(UserDto, httpResult)));
    }

    refreshToken(refreshTokenValue: string): Observable<TokenDto> {
        return this._httpClient
            .post("/user/refresh-token", new RefreshTokenDto(refreshTokenValue))
            .pipe(map((httpResult) => plainToClass(TokenDto, httpResult)));
    }

    getUserNfts(): Observable<Array<ProfileNftDto>> {
        return this._httpClient.get<Array<ProfileNftDto>>("/nft/user").pipe(
            map((results) => {
                return plainToInstance(ProfileNftDto, results);
            })
        );
    }
}
