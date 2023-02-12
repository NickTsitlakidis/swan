import { TrustWalletService } from "./evm-services/trust.wallet.service";
import { CoinBaseWalletService } from "./evm-services/coinbase.wallet.service";
import { WalletService } from "./wallet-service";
import { Injectable } from "@angular/core";
import { SolflareWalletService } from "./solana-services/solflare.wallet.service";
import { PhantomWalletService } from "./solana-services/phantom.wallet.service";
import { map, Observable, of, Subject } from "rxjs";
import { BlockchainWalletsFacade } from "../../store/blockchain-wallets-facade";
import { MetamaskWalletService } from "./evm-services/metamask.wallet.service";
import { BinanceWalletService } from "./evm-services/binance.wallet";
import { SupportedWallets } from "@swan/dto";

@Injectable({
    providedIn: "root"
})
export class WalletRegistryService {
    private _registry: Map<string, WalletService>;
    private _registryPopulated: Subject<boolean>;

    constructor(
        private _binanceService: BinanceWalletService,
        private _metamaskService: MetamaskWalletService,
        private _trustService: TrustWalletService,
        private _coinbaseService: CoinBaseWalletService,
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
                        if (wallet.name === SupportedWallets.METAMASK) {
                            this._registry.set(wallet.id, this._metamaskService);
                        } else if (wallet.name === SupportedWallets.PHANTOM) {
                            this._registry.set(wallet.id, this._phantomService);
                        } else if (wallet.name === SupportedWallets.BINANCE) {
                            this._registry.set(wallet.id, this._binanceService);
                        } else if (wallet.name === SupportedWallets.COINBASE) {
                            this._registry.set(wallet.id, this._coinbaseService);
                        } else if (wallet.name === SupportedWallets.TRUST) {
                            this._registry.set(wallet.id, this._trustService);
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
