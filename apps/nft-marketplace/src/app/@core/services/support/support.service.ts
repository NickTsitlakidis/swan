import { EMPTY, Observable, of } from "rxjs";
import { BlockchainWalletDto, CategoryDto, UserWalletDto } from "@nft-marketplace/common";
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { plainToInstance } from "class-transformer";
import { map } from "rxjs/operators";
import { SupportModule } from "./support.module";

@Injectable({
    providedIn: SupportModule
})
export class SupportService {
    constructor(private _httpClient: HttpClient) {}

    getBlockchainWallets(): Observable<Array<BlockchainWalletDto>> {
        return this._httpClient.get<Array<unknown>>("/support/blockchain-wallets").pipe(
            map((wallets) => {
                return plainToInstance(BlockchainWalletDto, wallets);
            })
        );
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
