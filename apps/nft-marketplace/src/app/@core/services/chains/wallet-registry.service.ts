import { WalletService } from "./wallet-service";
import { MetamaskService } from "./metamask.service";
import { Injectable } from "@angular/core";
import { SolflareWalletService } from "./solana-services/solflare.wallet.service";
import { PhantomWalletService } from "./solana-services/phantom.wallet.service";
import { map, Observable, of, Subject } from "rxjs";
import { BlockchainWalletsFacade } from "../../store/blockchain-wallets-facade";

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
        private _blockchainWalletsFacade: BlockchainWalletsFacade //todo: facades can potentially use this class. maybe a better architecture to avoid cyclic dependency
    ) {
        this._registry = new Map();
        this._registryPopulated = new Subject<boolean>();
    }

    getWalletService(walletId: string): Observable<WalletService | undefined> {
        if (this._registry.size > 0) {
            return of(this._registry.get(walletId));
        }

        return this._registryPopulated.pipe(
            map(() => {
                return this._registry.get(walletId);
            })
        );
    }

    populateRegistry() {
        this._blockchainWalletsFacade.streamWallets().subscribe((results) => {
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
            this._registryPopulated.next(true);
        });
    }
}
