import { WalletService } from "./wallet-service";
import { MetamaskService } from "./metamask.service";
import { Injectable } from "@angular/core";
import { SupportService } from "../support/support.service";
import { SolflareWalletService } from "./solana-services/solflare.wallet.service";
import { PhantomWalletService } from "./solana-services/phantom.wallet.service";

@Injectable({
    providedIn: "root"
})
export class WalletRegistryService {
    private _registry: Map<string, WalletService>;

    constructor(
        private _metamaskService: MetamaskService,
        private _supportService: SupportService,
        private _solflareService: SolflareWalletService,
        private _phantomService: PhantomWalletService
    ) {
        this._registry = new Map();
    }

    getWalletService(walletId: string): WalletService | undefined {
        return this._registry.get(walletId);
    }

    populateRegistry() {
        this._supportService.getBlockchainWallets().subscribe((results) => {
            results.forEach((dto) => {
                dto.wallets.forEach((wallet) => {
                    if (!this._registry.has(wallet.id)) {
                        if (wallet.name === "Metamask") {
                            this._registry.set(wallet.id, this._metamaskService);
                        } else if (wallet.name === "Phantom") {
                            this._registry.set(wallet.id, this._phantomService);
                        } else if (wallet.name === "Solflare") {
                            this._registry.set(wallet.id, this._solflareService);
                        }
                    }
                });
            });
        });
    }
}
