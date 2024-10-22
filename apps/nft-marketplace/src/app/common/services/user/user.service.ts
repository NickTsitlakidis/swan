import { Injectable } from "@angular/core";
import { HttpClient, HttpContext } from "@angular/common/http";
import { Observable } from "rxjs";
import {
    CompleteSignatureAuthenticationDto,
    EntityDto,
    NonceDto,
    ProfileNftDto,
    StartSignatureAuthenticationDto,
    TokenDto,
    UserDto
} from "@swan/dto";
import { map } from "rxjs/operators";
import { plainToClass, plainToInstance } from "class-transformer";
import { SKIP_ERROR_TOAST, SKIP_RETRY } from "../../interceptors/http-context-tokens";

@Injectable({
    providedIn: "root"
})
export class UserService {
    constructor(private readonly _httpClient: HttpClient) {}

    startSignatureAuthentication(body: StartSignatureAuthenticationDto): Observable<NonceDto> {
        return this._httpClient
            .post("/user/start-signature-authentication", body)
            .pipe(map((httpResult) => plainToClass(NonceDto, httpResult)));
    }

    startWalletAddition(body: StartSignatureAuthenticationDto): Observable<NonceDto> {
        return this._httpClient
            .post("/user/start-wallet-addition", body)
            .pipe(map((httpResult) => plainToClass(NonceDto, httpResult)));
    }

    completeWalletAddition(body: CompleteSignatureAuthenticationDto): Observable<EntityDto> {
        return this._httpClient
            .post("/user/complete-wallet-addition", body)
            .pipe(map((httpResult) => plainToClass(EntityDto, httpResult)));
    }

    completeSignatureAuthentication(completeBody: CompleteSignatureAuthenticationDto): Observable<TokenDto> {
        return this._httpClient
            .post("/user/complete-signature-authentication", completeBody, { withCredentials: true })
            .pipe(map((httpResult) => plainToClass(TokenDto, httpResult)));
    }

    getUser(): Observable<UserDto> {
        return this._httpClient.get("/user").pipe(map((httpResult) => plainToClass(UserDto, httpResult)));
    }

    refreshToken(): Observable<TokenDto> {
        return this._httpClient
            .post(
                "/user/refresh-token",
                {},
                { withCredentials: true, context: new HttpContext().set(SKIP_RETRY, true).set(SKIP_ERROR_TOAST, true) }
            )
            .pipe(map((httpResult) => plainToClass(TokenDto, httpResult)));
    }

    getNfts(): Observable<Array<ProfileNftDto>> {
        return this._httpClient.get<Array<ProfileNftDto>>("/nft/user").pipe(
            map((results) => {
                return plainToInstance(ProfileNftDto, results);
            })
        );
    }

    getExternalNfts(): Observable<Array<ProfileNftDto>> {
        return this._httpClient.get<Array<ProfileNftDto>>("/nft/user/external").pipe(
            map((results) => {
                return plainToInstance(ProfileNftDto, results);
            })
        );
    }
}
