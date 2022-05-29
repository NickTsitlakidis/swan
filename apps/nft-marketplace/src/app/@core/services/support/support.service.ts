import { Observable } from "rxjs";
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

    getBlockchainWallets(): Observable<Array<BlockchainWalletDto>> {}

    getCategories(): Observable<Array<CategoryDto>> {
        return this._httpClient.get<Array<unknown>>("/system/categories").pipe(
            map((categories) => {
                return plainToInstance(CategoryDto, categories);
            })
        );
    }

    filterBlockchainWallets(walletId: string): Observable<Array<BlockchainWalletDto>> {}

    getSelectedWallet(): Observable<UserWalletDto> {}

    getSelectedChain(): Observable<any> {}
}
