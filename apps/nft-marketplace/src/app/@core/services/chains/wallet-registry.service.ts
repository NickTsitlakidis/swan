import { WalletService } from "./wallet-service";
import { MetamaskService } from "./metamask.service";
import { Injectable } from "@angular/core";
import { SolflareWalletService } from "./solana-services/solflare.wallet.service";
import { PhantomWalletService } from "./solana-services/phantom.wallet.service";
import { Observable, of, Subject, switchMap, throwError } from "rxjs";
import { BlockchainWalletsStore } from "../../store/blockchain-wallets-store";
import { when } from "mobx";

@Injectable({
    providedIn: "root"
})
export class WalletRegistryService {
    private _registry: Map<string, WalletService>;
    private _registryPopulated: Subject<boolean>;

    constructor(
        private _metamaskService: MetamaskService,
        private _solflareService: SolflareWalletService,
        private _phantomService: PhantomWalletService,
        private _blockchainWalletsStore: BlockchainWalletsStore
    ) {
        this._registry = new Map();
        this._registryPopulated = new Subject<boolean>();
    }

    getWalletService(walletId: string): Observable<WalletService> {
        if (this._registry.size > 0) {
            const found = this._registry.get(walletId);
            if (found) {
                return of(found);
            } else {
                return throwError(() => "Unable to find wallet in registry");
            }
        }

        return this._registryPopulated.pipe(
            switchMap(() => {
                const found = this._registry.get(walletId);
                if (found) {
                    return of(found);
                } else {
                    return throwError(() => "Unable to find wallet in registry");
                }
            })
        );
    }

    populateRegistry() {
        const promise =
            this._blockchainWalletsStore.wallets.length > 0
                ? Promise.resolve()
                : when(() => this._blockchainWalletsStore.wallets.length > 0, { timeout: 2000 });

        promise.then(() => {
            this._blockchainWalletsStore.wallets.forEach((dto) => {
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
                this._registryPopulated.next(true);
            });
        });
    }
}
