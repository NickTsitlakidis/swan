import { ConnectionStore, Wallet, WalletStore } from "@heavy-duty/wallet-adapter";
import { WalletAdapterNetwork, WalletName } from "@solana/wallet-adapter-base";
import { clusterApiUrl, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import * as base58 from "bs58";
import { defer, EMPTY, forkJoin, from, of, Subject, throwError, Observable } from "rxjs";
import { concatMap, first, map, switchMap, take, filter } from "rxjs/operators";

import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { environment } from "../../../../../environments/environment";
import { WalletService } from "../wallet-service";
import { CreateNft } from "../create-nft";
import { WalletEvent, WalletEventType } from "../wallet-event";
import { CreateNftInput } from "@metaplex-foundation/js";
import { MetaplexService } from "./metaplex.service";
import { ListingDto, NftMintTransactionDto } from "@swan/dto";
import { MarketplaceResult } from "@swan/contracts";
import { CreateListing } from "../create-listing";

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
        const network = environment.production ? WalletAdapterNetwork.Mainnet : WalletAdapterNetwork.Devnet;
        const endpoint = clusterApiUrl(network);
        this.changeNetwork(endpoint);
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

    public changeNetwork(endpoint: string): void {
        this._connectionStore.setEndpoint(endpoint);
    }

    public signMessage(message: string): Observable<string> {
        const signMessage$ = this.walletStore.signMessage(new TextEncoder().encode(message));

        if (!signMessage$) {
            return throwError(() => new Error("Sign message method is not defined"));
        }

        return signMessage$.pipe(
            map((signature) => {
                return base58.encode(signature);
            }),
            first(),
            switchMap((signed) => {
                if (signed) {
                    return of(signed);
                }
                return throwError(() => new Error("Unable to sign message through Solana wallet"));
            })
        );
    }

    public mint(nft: CreateNft): Observable<NftMintTransactionDto> {
        return forkJoin([this.getPublicKey(), this._completeWalletObservable()]).pipe(
            switchMap(([publicKey, wallet]) => {
                const nftInput = {
                    uri: nft.metadataUri,
                    name: nft.name,
                    symbol: nft.symbol,
                    sellerFeeBasisPoints: nft.resellPercentage,
                    isMutable: false,
                    maxSupply: nft.maxSupply,
                    tokenOwner: new PublicKey(publicKey)
                } as CreateNftInput;

                if (wallet) {
                    return from(this._metaplexService.mintNFT(nftInput, wallet));
                } else {
                    return throwError(() => {
                        return new Error("Could not found wallet");
                    });
                }
            }),

            switchMap((mintResponse) => {
                if (mintResponse) {
                    return of(
                        new NftMintTransactionDto(
                            nft.id,
                            mintResponse.response.signature,
                            mintResponse.tokenAddress.toString()
                        )
                    );
                } else {
                    return throwError(() => {
                        return new Error("Could not mint token");
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

    createListing(listing: CreateListing): Observable<string> {
        return this._completeWalletObservable().pipe(
            switchMap((wallet) => {
                if (!listing.nftAddress || !wallet) {
                    return EMPTY;
                }
                return from(this._metaplexService.createListing(listing.nftAddress, listing.price, wallet));
            }),
            switchMap((listingOutput) => {
                if (!listingOutput) {
                    return of();
                }
                return listingOutput.response.signature;
            })
        );
    }

    getListingResult(transactionHash: string, marketplaceContractAddress: string): Observable<MarketplaceResult> {
        return EMPTY;
    }

    buyToken(listing: ListingDto): Observable<string> {
        return EMPTY;
    }

    private _completeWalletObservable(): Observable<Wallet | null> {
        return new Observable<Wallet | null>((subscriber) => {
            this.wallet$.subscribe((wallet) => {
                subscriber.next(wallet);
                subscriber.complete();
            });
        });
    }
}
