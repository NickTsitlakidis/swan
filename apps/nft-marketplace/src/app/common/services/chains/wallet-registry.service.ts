import { WalletService } from "./wallet-service";
import { Injectable, Injector } from "@angular/core";
import { Observable, of, Subject, switchMap, throwError } from "rxjs";
import { BlockchainWalletsStore } from "../../store/blockchain-wallets-store";
import { when } from "mobx";
import { SupportedWallets } from "@swan/dto";

@Injectable()
export class WalletRegistryService {
    private _registry: Map<string, WalletService>;
    private _registryPopulated: Subject<boolean>;

    constructor(private _injector: Injector, private _blockchainWalletsStore: BlockchainWalletsStore) {
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
        let metamaskService: WalletService;
        let phantomService: WalletService;
        let binanceService: WalletService;
        let coinbaseService: WalletService;
        let trustService: WalletService;
        let solflareService: WalletService;
        import("./solana-services/solflare.wallet.service")
            .then((serviceImport) => {
                solflareService = this._injector.get(serviceImport.SolflareWalletService);
                return import("./solana-services/phantom.wallet.service");
            })
            .then((serviceImport) => {
                phantomService = this._injector.get(serviceImport.PhantomWalletService);
                return import("./evm-services/binance.wallet");
            })
            .then((serviceImport) => {
                binanceService = this._injector.get(serviceImport.BinanceWalletService);
                return import("./evm-services/metamask.wallet.service");
            })
            .then((serviceImport) => {
                metamaskService = this._injector.get(serviceImport.MetamaskWalletService);
                return import("./evm-services/coinbase.wallet.service");
            })
            .then((serviceImport) => {
                coinbaseService = this._injector.get(serviceImport.CoinBaseWalletService);
                return import("./evm-services/trust.wallet.service");
            })
            .then((serviceImport) => {
                trustService = this._injector.get(serviceImport.TrustWalletService);
                return this._blockchainWalletsStore.wallets.length > 0
                    ? Promise.resolve()
                    : when(() => this._blockchainWalletsStore.wallets.length > 0, { timeout: 5000 });
            })
            .then(() => {
                this._blockchainWalletsStore.wallets.forEach((dto) => {
                    dto.wallets.forEach((wallet) => {
                        if (!this._registry.has(wallet.id)) {
                            if (wallet.name === SupportedWallets.METAMASK) {
                                this._registry.set(wallet.id, metamaskService);
                            } else if (wallet.name === SupportedWallets.PHANTOM) {
                                this._registry.set(wallet.id, phantomService);
                            } else if (wallet.name === SupportedWallets.BINANCE) {
                                this._registry.set(wallet.id, binanceService);
                            } else if (wallet.name === SupportedWallets.COINBASE) {
                                this._registry.set(wallet.id, coinbaseService);
                            } else if (wallet.name === SupportedWallets.TRUST) {
                                this._registry.set(wallet.id, trustService);
                            } else if (wallet.name === "Solflare") {
                                this._registry.set(wallet.id, solflareService);
                            }
                        }
                    });
                    this._registryPopulated.next(true);
                });
            });
    }
}
