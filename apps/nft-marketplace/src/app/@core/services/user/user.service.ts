import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of, Subject } from "rxjs";
import { ProfileNftDto, UserWalletDto } from "@swan/dto";
import { map } from "rxjs/operators";
import { plainToInstance } from "class-transformer";

@Injectable({
    providedIn: "root"
})
export class UserService {
    public wallets: UserWalletDto[] = [];
    private _walletPopulated: Subject<boolean>;

    constructor(private readonly _httpClient: HttpClient) {
        this._walletPopulated = new Subject<boolean>();
        this._retrieveUserWallets().subscribe((wallets) => {
            this.wallets = wallets;
            this._walletPopulated.next(true);
        });
    }

    getUserWallets(): Observable<Array<UserWalletDto>> {
        if (this.wallets.length > 0) {
            return of(this.wallets);
        }

        return this._walletPopulated.pipe(
            map(() => {
                return this.wallets;
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
