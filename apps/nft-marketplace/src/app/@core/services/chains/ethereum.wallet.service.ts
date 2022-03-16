import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { BlockChains } from "../../interfaces/blockchain.interface";
import { MetaMaskAuthService } from "./metamask.wallet.service";

@Injectable({
    providedIn: "root"
})
export class EthereumWalletService {
    private _wallets: any = {};

    constructor(private _metaMaskAuthService: MetaMaskAuthService) {
        this._wallets["metamask"] = {
            key: this._metaMaskAuthService.getPublicKey.bind(this),
            wallets: this._metaMaskAuthService.getWallets.bind(_metaMaskAuthService)
        };
    }

    public getPublicKey(wallet: string): Observable<string | undefined> {
        return this._wallets[wallet].key();
    }

    public getWallets(wallet: string): Observable<BlockChains> {
        return this._wallets[wallet].wallets();
    }
}
