import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { UserWalletDto } from "@nft-marketplace/common";
import { map } from "rxjs/operators";
import { plainToInstance } from "class-transformer";

@Injectable({
    providedIn: "root"
})
export class UserService {
    constructor(private readonly _httpClient: HttpClient) {}

    getUserWallets(): Observable<Array<UserWalletDto>> {
        return this._httpClient.get<Array<unknown>>("/user/user-wallets").pipe(
            map((results) => {
                return plainToInstance(UserWalletDto, results);
            })
        );
    }
}
