import { CreateListing } from "./../create-listing";
import { SolanaWalletService } from "./solana.wallet.service";
import { LocalStorageService } from "ngx-webstorage";

import { ConnectionStore, WalletStore } from "@heavy-duty/wallet-adapter";
import { MetaplexService } from "./metaplex.service";
import { Injectable } from "@angular/core";
import { ChainsModule } from "../chains.module";
import { EMPTY, Observable, switchMap } from "rxjs";
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
        this.walletStore.selectWallet("Phantom" as WalletName);
        return super.getPublicKey();
    }

    public override createListing(listing: CreateListing): Observable<string> {
        return this.walletStore.connected$.pipe(
            switchMap((connected) => {
                if (connected) {
                    this.walletStore.selectWallet("Phantom" as WalletName);
                    return super.createListing(listing);
                }
                return EMPTY;
            })
        );
    }
}
