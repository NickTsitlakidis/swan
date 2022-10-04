import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { CovalentNftsResponse } from "./covalent-nfts-response";
import { CovalentTransactionsResponse } from "./covalent-transactions-response";

Injectable();
export class CovalentService {
    key: string;

    constructor(private _configService: ConfigService, private _httpService: HttpService) {
        this.key = this._configService.get("COVALENTHQ_KEY");
    }

    async fetchNfts(chainId: number, address: string) {
        const url = `https://api.covalenthq.com/v1/${chainId}/address/${address}/balances_v2/?quote-currency=USD&format=JSON&nft=true&no-nft-fetch=false&key=${this.key}`;
        return await firstValueFrom(this._httpService.get<CovalentNftsResponse>(url));
    }

    async fetchNftTransactions(chainId: number, tokenId: number, tokenContractAddress: string) {
        const url = `https://api.covalenthq.com/v1/${chainId}/tokens/${tokenContractAddress}/nft_transactions/${tokenId}?key=${this.key}`;

        return await firstValueFrom(this._httpService.get<CovalentTransactionsResponse>(url));
    }
}
