import { Injectable } from "@angular/core";
import { ConnectionStore, WalletStore } from "@heavy-duty/wallet-adapter";
import { WalletAdapterNetwork, WalletName } from "@solana/wallet-adapter-base";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import * as base58 from "bs58";
import { defer, forkJoin, from, of, Subject, throwError } from "rxjs";
import { concatMap, first, map, switchMap, take } from "rxjs/operators";

import { Observable } from "rxjs";
import { filter } from "rxjs/operators";

import {
    LedgerWalletAdapter,
    PhantomWalletAdapter,
    SlopeWalletAdapter,
    SolflareWalletAdapter,
    SolletWalletAdapter,
    TorusWalletAdapter
} from "@solana/wallet-adapter-wallets";
import { environment } from "../../../../environments/environment";
import { WalletService } from "./wallet-service";
import { CreateNft, MintTransaction } from "./nft";
import { WalletEvent, WalletEventType } from "./wallet-event";
import { CreateNftInput } from "@metaplex-foundation/js-next";
import { MetaplexService } from "./metaplex.service";
import { SwanError } from "../../interfaces/swan-error";
import { ChainsModule } from "./chains.module";
import { LocalStorageService } from "ngx-webstorage";

export const isNotNull = <T>(source: Observable<T | null>) =>
    source.pipe(filter((item: T | null): item is T => item !== null));

@Injectable({
    providedIn: ChainsModule
})
export class SolanaWalletService implements WalletService {
    private readonly connection$ = this._connectionStore.connection$;
    private readonly wallets$ = this._walletStore.wallets$;
    public readonly wallet$ = this._walletStore.wallet$;
    /* private readonly walletName$ = this.wallet$.pipe(map((wallet: Wallet | null) => wallet?.adapter.name || null));
    private readonly ready$ = this.wallet$.pipe(
        map(
            (wallet) =>
                wallet &&
                (wallet.adapter.readyState === WalletReadyState.Installed ||
                    wallet.adapter.readyState === WalletReadyState.Loadable)
        )
    ); */
    public readonly connected$ = this._walletStore.connected$;
    public readonly publicKey$ = this._walletStore.publicKey$;
    private lamports = 0;
    private recipient = "";
    private _events: Subject<WalletEvent>;

    constructor(
        private readonly _connectionStore: ConnectionStore,
        private readonly _walletStore: WalletStore,
        private _metaplexService: MetaplexService,
        private _lcStorage: LocalStorageService
    ) {
        this._events = new Subject<WalletEvent>();
        this._connectionStore.setEndpoint(environment.solanaNetwork);
        this._walletStore.setAdapters([
            new PhantomWalletAdapter(),
            new SlopeWalletAdapter(),
            new SolflareWalletAdapter(),
            new TorusWalletAdapter(),
            new LedgerWalletAdapter(),
            new SolletWalletAdapter({ network: WalletAdapterNetwork.Devnet })
        ]);
        this._walletStore.connected$.subscribe(() => {
            const e = {
                type: WalletEventType.Connected,
                walletName: "",
                walletId: ""
            } as WalletEvent;
            this._events.next(e);
        });

        this._walletStore.disconnecting$.subscribe(() => {
            const e = {
                type: WalletEventType.Disconnected,
                walletName: "",
                walletId: ""
            } as WalletEvent;
            this._events.next(e);
        });
    }

    public getPublicKey(walletName?: string): Observable<string> {
        const walletFromLocalStorage = this._lcStorage.retrieve("walletName");
        this._walletStore.selectWallet((walletName || walletFromLocalStorage) as WalletName);
        return this.publicKey$.pipe(
            filter((data) => data !== null),
            map((data) => {
                return data?.toString() || "";
            }),
            take(1)
        );
    }

    public signMessage(message: string): Observable<string | undefined> {
        const signMessage$ = this._walletStore.signMessage(new TextEncoder().encode(message));

        if (!signMessage$) {
            console.error(new Error("Sign message method is not defined"));
            return of();
        }

        return signMessage$.pipe(
            map((signature) => {
                return base58.encode(signature);
            }),
            first()
        );
    }

    public mint(nft: CreateNft): Observable<MintTransaction> {
        return forkJoin([this.getPublicKey(), this.wallet$]).pipe(
            switchMap(([publicKey, wallet]) => {
                const nftInput = {
                    uri: nft.metadataUri,
                    name: nft.name,
                    symbol: nft.symbol,
                    sellerFeeBasisPoints: nft.resellPercentage,
                    isMutable: false,
                    maxSupply: nft.maxSupply,
                    owner: new PublicKey(publicKey)
                } as CreateNftInput;

                if (wallet) {
                    return this._metaplexService.mintNFT(nftInput, wallet);
                } else {
                    return throwError(() => {
                        return new SwanError("Could not found wallet");
                    });
                }
            }),

            switchMap((mintResponse) => {
                if (mintResponse) {
                    const mintTransaction = {
                        transactionId: mintResponse.transactionId,
                        tokenAddress: mintResponse.associatedToken.toString(),
                        metadataUri: mintResponse.metadata.toString()
                    } as MintTransaction;
                    return of(mintTransaction);
                } else {
                    return throwError(() => {
                        return new SwanError("Could not mint token");
                    });
                }
            })
        );
    }

    public getEvents(): Observable<WalletEvent> {
        return this._events.asObservable();
    }

    public onSelectWallet(walletName: WalletName) {
        this._walletStore.selectWallet(walletName);
        const e = {
            type: WalletEventType.Selected,
            walletName: "",
            walletId: ""
        } as WalletEvent;
        this._events.next(e);
    }

    public onSendTransaction(fromPubkey: PublicKey) {
        this.connection$
            .pipe(
                first(),
                isNotNull,
                concatMap((connection) =>
                    from(defer(() => connection.getRecentBlockhash())).pipe(
                        concatMap(({ blockhash }) =>
                            this._walletStore.sendTransaction(
                                new Transaction({
                                    recentBlockhash: blockhash,
                                    feePayer: fromPubkey
                                }).add(
                                    SystemProgram.transfer({
                                        fromPubkey,
                                        toPubkey: new PublicKey(this.recipient),
                                        lamports: this.lamports
                                    })
                                ),
                                connection
                            )
                        )
                    )
                )
            )
            .subscribe({
                next: (v) => console.log(v),
                error: (e) => console.error(e)
            });
    }

    public onSignTransaction(fromPubkey: PublicKey) {
        this.connection$
            .pipe(
                first(),
                isNotNull,
                concatMap((connection) =>
                    from(defer(() => connection.getRecentBlockhash())).pipe(
                        map(({ blockhash }) =>
                            new Transaction({
                                recentBlockhash: blockhash,
                                feePayer: fromPubkey
                            }).add(
                                SystemProgram.transfer({
                                    fromPubkey,
                                    toPubkey: new PublicKey(this.recipient),
                                    lamports: this.lamports
                                })
                            )
                        )
                    )
                ),
                concatMap((transaction) => {
                    const signTransaction$ = this._walletStore.signTransaction(transaction);

                    if (!signTransaction$) {
                        return throwError(new Error("Sign transaction method is not defined"));
                    }

                    return signTransaction$;
                })
            )
            .subscribe({
                next: (v) => console.log(v),
                error: (e) => console.error(e)
            });
    }
}
