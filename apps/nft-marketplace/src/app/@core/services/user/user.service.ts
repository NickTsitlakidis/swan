import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { ProfileNftDto, UserWalletDto } from "@swan/dto";
import { map } from "rxjs/operators";
import { plainToInstance } from "class-transformer";

@Injectable({
    providedIn: "root"
})
export class UserService {
    public wallets: UserWalletDto[] = [];

    constructor(private readonly _httpClient: HttpClient) {}

    getUserWallets(): Observable<Array<UserWalletDto>> {
        if (this.wallets.length > 0) {
            return of(this.wallets);
        }

        return this._retrieveUserWallets().pipe(
            map((wallets) => {
                this.wallets = wallets;
                return wallets;
            })
        );
    }

    getUserNfts(): Observable<Array<ProfileNftDto>> {
        return this._httpClient.get<Array<ProfileNftDto>>("/nft/user").pipe(
            map((results) => {
                return plainToInstance(ProfileNftDto, results);
            })
        );
    }

    private _retrieveUserWallets(): Observable<Array<UserWalletDto>> {
        return this._httpClient.get<Array<unknown>>("/user/user-wallets").pipe(
            map((results) => {
                return plainToInstance(UserWalletDto, results);
            })
        );
    }
}
