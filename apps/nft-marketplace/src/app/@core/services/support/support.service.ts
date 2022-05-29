import { Observable } from "rxjs";
import { BlockchainWalletDto, CategoryDto, UserWalletDto } from "@nft-marketplace/common";
import { Injectable } from "@angular/core";

@Injectable({
    providedIn:"root"
})
export class SupportService {
    getBlockchainWallets():Observable<Array<BlockchainWalletDto>>;
    getCategories(): Observable<Array<CategoryDto>>;
    filterBlockchainWallets(walletId: string):Observable<Array<BlockchainWalletDto>>;
    getSelectedWallet(): Observable<UserWalletDto>;
    getSelectedChain(): Observable<any>;
}