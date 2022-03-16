import { Injectable } from "@angular/core";
import { ConnectionStore, WalletStore, Wallet } from "@heavy-duty/wallet-adapter";
import { WalletAdapterNetwork, WalletName, WalletReadyState } from "@solana/wallet-adapter-base";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import * as base58 from "bs58";
import { defer, from, throwError } from "rxjs";
import { concatMap, first, map } from "rxjs/operators";

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
import { BlockChains } from "../../interfaces/blockchain.interface";

export const isNotNull = <T>(source: Observable<T | null>) =>
    source.pipe(filter((item: T | null): item is T => item !== null));

@Injectable({
    providedIn: "root"
})
export class SolanaWalletService {
    private readonly connection$ = this._connectionStore.connection$;
    private readonly wallets$ = this._walletStore.wallets$;
    private readonly wallet$ = this._walletStore.wallet$;
    private readonly walletName$ = this.wallet$.pipe(map((wallet: Wallet | null) => wallet?.adapter.name || null));
    private readonly ready$ = this.wallet$.pipe(
        map(
            (wallet) =>
                wallet &&
                (wallet.adapter.readyState === WalletReadyState.Installed ||
                    wallet.adapter.readyState === WalletReadyState.Loadable)
        )
    );
    public readonly connected$ = this._walletStore.connected$;
    public readonly publicKey$ = this._walletStore.publicKey$;
    private lamports = 0;
    private recipient = "";

    constructor(private readonly _connectionStore: ConnectionStore, private readonly _walletStore: WalletStore) {
        this._connectionStore.setEndpoint("http://api.devnet.solana.com");
        this._walletStore.setAdapters([
            new PhantomWalletAdapter(),
            new SlopeWalletAdapter(),
            new SolflareWalletAdapter(),
            new TorusWalletAdapter(),
            new LedgerWalletAdapter(),
            new SolletWalletAdapter({ network: WalletAdapterNetwork.Devnet })
        ]);
    }

    public getWallets(): Observable<BlockChains> {
        return this.wallets$.pipe(
            map((wallets: Wallet[]) => {
                const blockchain: BlockChains = {
                    chain: {
                        title: "Solana",
                        imageUrl: "",
                        service: this
                    },
                    wallets
                };
                return blockchain;
            }),
            first()
        );
    }

    public getPublicKey(): Observable<string | undefined> {
        return this.publicKey$.pipe(
            map((data) => {
                return data?.toString();
            }),
            first()
        );
    }

    public onConnect() {
        this._walletStore.connect().subscribe();
    }

    public onDisconnect() {
        this._walletStore.disconnect().subscribe();
    }

    public onSelectWallet(walletName: WalletName) {
        this._walletStore.selectWallet(walletName);
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

    public onSignAllTransactions(fromPubkey: PublicKey) {
        this.connection$
            .pipe(
                first(),
                isNotNull,
                concatMap((connection) =>
                    from(defer(() => connection.getRecentBlockhash())).pipe(
                        map(({ blockhash }) =>
                            new Array(3).fill(0).map(() =>
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
                    )
                ),
                concatMap((transactions) => {
                    const signAllTransaction$ = this._walletStore.signAllTransactions(transactions);

                    if (!signAllTransaction$) {
                        return throwError(new Error("Sign all transactions method is not defined"));
                    }

                    return signAllTransaction$;
                })
            )
            .subscribe({
                next: (v) => console.log(v),
                error: (e) => console.error(e)
            });
    }

    public onSignMessage(msg: string): Observable<string> | undefined {
        const signMessage$ = this._walletStore.signMessage(new TextEncoder().encode(msg));

        if (!signMessage$) {
            console.error(new Error("Sign message method is not defined"));
            return;
        }

        return signMessage$.pipe(
            map((signature) => {
                return base58.encode(signature);
            }),
            first()
        );
    }
}
