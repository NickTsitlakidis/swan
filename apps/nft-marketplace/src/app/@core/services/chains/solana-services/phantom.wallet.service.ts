import { SolanaWalletService } from "./solana.wallet.service";
import { LocalStorageService } from "ngx-webstorage";

import { ConnectionStore, WalletStore } from "@heavy-duty/wallet-adapter";
import { MetaplexService } from "./metaplex.service";
import { Injectable } from "@angular/core";
import { ChainsModule } from "../chains.module";
import { Observable } from "rxjs";
import { WalletName } from "@solana/wallet-adapter-base";

@Injectable({
    providedIn: ChainsModule
})
export class PhantomWalletService extends SolanaWalletService {
    constructor(
        private _lcStorage: LocalStorageService,
        connectionStore: ConnectionStore,
        walletStore: WalletStore,
        metaplexService: MetaplexService
    ) {
        super(connectionStore, walletStore, metaplexService);
    }

    public override getPublicKey(): Observable<string> {
        const walletFromLocalStorage = this._lcStorage.retrieve("walletName");
        this.walletStore.selectWallet(("Phantom" || walletFromLocalStorage) as WalletName);
        return super.getPublicKey();
    }
}
