import { Injectable } from "@angular/core";
import { ConnectionStore, WalletStore } from "@heavy-duty/wallet-adapter";

import { Observable } from "rxjs";
import { MetaplexService } from "./metaplex.service";
import { ChainsModule } from "../chains.module";
import { LocalStorageService } from "ngx-webstorage";
import { SolanaWalletService } from "./solana.wallet.service";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { WalletName } from "@solana/wallet-adapter-base";

@Injectable({
    providedIn: ChainsModule
})
export class SolflareWalletService extends SolanaWalletService {
    constructor(
        private _lcStorage: LocalStorageService,
        connectionStore: ConnectionStore,
        walletStore: WalletStore,
        metaplexService: MetaplexService
    ) {
        super(connectionStore, walletStore, metaplexService);
        super.walletStore.setAdapters([new SolflareWalletAdapter()]);
    }

    public override getPublicKey(): Observable<string> {
        const walletFromLocalStorage = this._lcStorage.retrieve("walletName");
        super.walletStore.selectWallet(("Solflare" || walletFromLocalStorage) as WalletName);
        return super.getPublicKey();
    }
}
