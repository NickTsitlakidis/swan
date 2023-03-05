import { Observable } from "rxjs";
import { BlockchainWalletDto, CategoryDto, EvmContractDto } from "@swan/dto";
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { plainToInstance } from "class-transformer";
import { map, switchMap } from "rxjs/operators";
import { environment } from "../../../../environments/environment";
import { v4 as uuidv4 } from "uuid";
import { SignS3URIResponse } from "./sign-s3-uri-response";

@Injectable({
    providedIn: "root"
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

    getEvmMarketplaceContracts(): Observable<Array<EvmContractDto>> {
        return this._httpClient.get<Array<unknown>>("/support/evm-marketplace-contracts").pipe(
            map((contracts) => {
                return plainToInstance(EvmContractDto, contracts);
            })
        );
    }

    getEvmErc721Contracts(): Observable<Array<EvmContractDto>> {
        return this._httpClient.get<Array<unknown>>("/support/evm-erc721-contracts").pipe(
            map((contracts) => {
                return plainToInstance(EvmContractDto, contracts);
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
