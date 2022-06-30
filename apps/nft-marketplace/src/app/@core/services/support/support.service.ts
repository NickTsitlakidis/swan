import { EMPTY, Observable, of } from "rxjs";
import { BlockchainWalletDto, CategoryDto, UserWalletDto } from "@nft-marketplace/common";
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { plainToInstance } from "class-transformer";
import { map, switchMap } from "rxjs/operators";
import { SupportModule } from "./support.module";
import { environment } from "../../../../environments/environment";
import { SignS3URIResponse } from "./support";
import { v4 as uuidv4 } from "uuid";

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

    uploadFileToS3(file: File): Observable<string> {
        return this._httpClient
            .post<SignS3URIResponse>(environment.lambdaS3Uri, { key: uuidv4(), contentType: file.type })
            .pipe(
                switchMap((response) => {
                    const formData = new FormData();
                    formData.append("data", file);

                    return this._httpClient.put(response.uploadURL, formData).pipe(
                        map(() => {
                            return response.s3Uri;
                        })
                    );
                })
            );
    }
}
