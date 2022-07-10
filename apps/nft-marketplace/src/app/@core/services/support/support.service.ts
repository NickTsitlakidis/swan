import { Observable } from "rxjs";
import { BlockchainWalletDto, CategoryDto } from "@nft-marketplace/common";
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

    uploadFileToS3(file: File): Observable<string> {
        const s3FileName = uuidv4();
        return this._httpClient
            .post<SignS3URIResponse>(environment.lambdaS3Uri, { key: s3FileName, contentType: file.type })
            .pipe(
                switchMap((response) => {
                    return this._httpClient
                        .put(response.uploadURL, file, {
                            headers: {
                                "Content-Type": file.type
                            }
                        })
                        .pipe(
                            map(() => {
                                return response.s3Uri;
                            })
                        );
                })
            );
    }
}
