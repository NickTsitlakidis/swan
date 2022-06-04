import { EMPTY, Observable, of } from "rxjs";
import { BlockchainWalletDto, CategoryDto, UserWalletDto } from "@nft-marketplace/common";
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { plainToInstance } from "class-transformer";
import { map } from "rxjs/operators";

@Injectable({
    providedIn: "root"
})
export class SupportService {
    constructor(private _httpClient: HttpClient) {}

    getBlockchainWallets(): Observable<Array<BlockchainWalletDto>> {
        return of([]);
    }

    getCategories(): Observable<Array<CategoryDto>> {
        return this._httpClient.get<Array<unknown>>("/support/categories").pipe(
            map((categories) => {
                return plainToInstance(CategoryDto, categories);
            })
        );
    }

    filterBlockchainWallets(walletId: string): Observable<Array<BlockchainWalletDto>> {
        return of([]);
    }

    getSelectedWallet(): Observable<UserWalletDto> {
        return EMPTY;
    }

    getSelectedChain(): Observable<any> {
        return EMPTY;
    }
}
