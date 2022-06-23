import { ConnectionStore, Wallet, WalletStore } from "@heavy-duty/wallet-adapter";
import { WalletName } from "@solana/wallet-adapter-base";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import * as base58 from "bs58";
import { defer, forkJoin, from, of, Subject, throwError } from "rxjs";
import { concatMap, first, map, switchMap, take } from "rxjs/operators";

import { Observable } from "rxjs";
import { filter } from "rxjs/operators";

import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { environment } from "../../../../../environments/environment";
import { WalletService } from "../wallet-service";
import { CreateNft, MintTransaction } from "../nft";
import { WalletEvent, WalletEventType } from "../wallet-event";
import { CreateNftInput } from "@metaplex-foundation/js-next";
import { MetaplexService } from "./metaplex.service";
import { SwanError } from "../../../interfaces/swan-error";
import { NFTStorageMetaplexor, PackagedNFT, prepareMetaplexNFT, ServiceContext } from "@nftstorage/metaplex-auth";

export const isNotNull = <T>(source: Observable<T | null>) =>
    source.pipe(filter((item: T | null): item is T => item !== null));

export class SolanaWalletService implements WalletService {
    private readonly connection$;
    private readonly wallets$;
    public readonly wallet$;
    public readonly connected$;
    public readonly publicKey$;
    private lamports;
    private recipient;
    private _events: Subject<WalletEvent>;

    constructor(
        private readonly _connectionStore: ConnectionStore,
        public readonly walletStore: WalletStore,
        private _metaplexService: MetaplexService
    ) {
        this.connection$ = this._connectionStore.connection$;
        this.wallets$ = this.walletStore.wallets$;
        this.wallet$ = this.walletStore.wallet$;
        this.connected$ = this.walletStore.connected$;
        this.publicKey$ = this.walletStore.publicKey$;
        this.lamports = 0;
        this.recipient = "";
        this._events = new Subject<WalletEvent>();
        this._connectionStore.setEndpoint(environment.solanaNetwork);
        this.walletStore.setAdapters([new PhantomWalletAdapter(), new SolflareWalletAdapter()]);
        this.walletStore.connected$.subscribe(() => {
            const e = {
                type: WalletEventType.Connected,
                walletName: "",
                walletId: ""
            } as WalletEvent;
            this._events.next(e);
        });

        this.walletStore.disconnecting$.subscribe(() => {
            const e = {
                type: WalletEventType.Disconnected,
                walletName: "",
                walletId: ""
            } as WalletEvent;
            this._events.next(e);
        });
    }

    public getPublicKey(): Observable<string> {
        return this.publicKey$.pipe(
            filter((data) => data !== null),
            map((data) => {
                return data?.toString() || "";
            }),
            take(1)
        );
    }

    public signMessage(message: string): Observable<string | undefined> {
        const signMessage$ = this.walletStore.signMessage(new TextEncoder().encode(message));

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
        const completeWalletObservable = new Observable<Wallet | null>((subscriber) => {
            this.wallet$.subscribe((wallet) => {
                subscriber.next(wallet);
                subscriber.complete();
            });
        });

        return forkJoin([this.getPublicKey(), completeWalletObservable]).pipe(
            switchMap(([publicKey, wallet]) => {
                const imageUri = URL.createObjectURL(nft.file);
                const metadata = {
                    name: nft.name,
                    symbol: nft.symbol,
                    description: nft.name,
                    seller_fee_basis_points: nft.resellPercentage,
                    image: imageUri,
                    attributes: nft.metadata,
                    collection: {
                        name: "Swan dummy collection",
                        family: "Swan"
                    },
                    properties: {
                        files: [
                            {
                                uri: imageUri,
                                type: nft.file.type
                            }
                        ],
                        category: "image",
                        creators: [
                            {
                                address: publicKey,
                                share: nft.maxSupply
                            }
                        ]
                    }
                };

                prepareMetaplexNFT(metadata, nft.file)
                    .then((preparedNFT: PackagedNFT) => {
                        const signer = () => {
                            return this.walletStore.signMessage(new TextEncoder().encode("message"))?.toPromise();
                        };

                        NFTStorageMetaplexor.storePreparedNFT(
                            {
                                auth: {
                                    chain: "solana",
                                    solanaCluster: "devnet",
                                    mintingAgent: "swan",
                                    signMessage: signer,
                                    publicKey: new TextEncoder().encode(publicKey)
                                }
                            } as ServiceContext,
                            preparedNFT
                        );
                    })
                    .catch((e) => {
                        console.log(e);
                    });
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
                    return from(this._metaplexService.mintNFT(nftInput, wallet));
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
        this.walletStore.selectWallet(walletName);
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
                            this.walletStore.sendTransaction(
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
                    const signTransaction$ = this.walletStore.signTransaction(transaction);

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
