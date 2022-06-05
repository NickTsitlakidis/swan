import { WalletService } from "./wallet-service";
import { MetamaskService } from "./metamask.service";
import { Injectable } from "@angular/core";
import { SupportService } from "../support/support.service";

@Injectable({
    providedIn: "root"
})
export class WalletRegistryService {
    private _registry: Map<string, WalletService>;

    constructor(private _metamaskService: MetamaskService, private _supportService: SupportService) {
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
                        }
                    }
                });
            });
        });
    }
}
