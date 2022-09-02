import { SolanaWalletService } from "./solana.wallet.service";

import { ConnectionStore, WalletStore } from "@heavy-duty/wallet-adapter";
import { MetaplexService } from "./metaplex.service";
import { Injectable } from "@angular/core";
import { ChainsModule } from "../chains.module";
import { EMPTY, Observable, switchMap } from "rxjs";
import { WalletName } from "@solana/wallet-adapter-base";

@Injectable({
    providedIn: ChainsModule
})
export class SolflareWalletService extends SolanaWalletService {
    constructor(connectionStore: ConnectionStore, walletStore: WalletStore, metaplexService: MetaplexService) {
        super(connectionStore, walletStore, metaplexService);
    }

    public override getPublicKey(): Observable<string> {
        this.walletStore.selectWallet("Solflare" as WalletName);
        return super.getPublicKey();
    }

    public override createListing(
        price: number,
        tokenContractAddress?: string | undefined,
        tokenId?: number | undefined,
        nftAddress?: string | undefined
    ): Observable<string> {
        return this.walletStore.connected$.pipe(
            switchMap((connected) => {
                if (connected) {
                    this.walletStore.selectWallet("Solflare" as WalletName);
                    return super.createListing(price, tokenContractAddress, tokenId, nftAddress);
                }
                return EMPTY;
            })
        );
    }
}
