import { WalletService } from "./wallet-service";
import { EMPTY, from, map, Observable, of, Subject, switchMap, throwError, zip } from "rxjs";
import { WalletEvent } from "./wallet-event";
import { ethers } from "ethers";
import { isNil } from "lodash";
import { CreateNft, MintTransaction } from "./nft";
import { Injectable } from "@angular/core";
import fantomSwanNft from "../../../../assets/evm-abi/fantom-swan-nft.json";
import { ChainsModule } from "./chains.module";
import { TransactionResponse } from "@ethersproject/abstract-provider/src.ts";

@Injectable({
    providedIn: ChainsModule
})
export class MetamaskService implements WalletService {
    private _events: Subject<WalletEvent>;
    private _ethersProvider: ethers.providers.Web3Provider;

    constructor() {
        this._events = new Subject<WalletEvent>();
    }

    getEvents(): Observable<WalletEvent> {
        return this._events.asObservable();
    }

    getPublicKey(): Observable<string> {
        return this.getEthersProvider().pipe(
            switchMap(() => {
                return this._ethersProvider.getSigner().getAddress();
            })
        );
    }

    mint(nft: CreateNft): Observable<MintTransaction> {
        return this.getPublicKey().pipe(
            switchMap((publicKey) => {
                const contract = new ethers.Contract(fantomSwanNft.address, fantomSwanNft.abi, this._ethersProvider);
                return zip(of(contract.connect(this._ethersProvider.getSigner())), of(publicKey));
            }),
            switchMap(([contract, publicKey]) => {
                return zip(of(contract), of(publicKey), from(contract["createItem"](publicKey, nft.metadataUri)));
            }),
            switchMap(([contract, publicKey, createItemResult]) => {
                const filter = contract.filters["Transfer"](null, publicKey);

                return new Observable<MintTransaction>((subscriber) => {
                    contract.on(filter, (from, to, amount, event) => {
                        if (event.transactionHash === (createItemResult as TransactionResponse).hash) {
                            const mintTransaction: MintTransaction = {
                                tokenId: ethers.BigNumber.from(event.args[2]).toNumber().toString(),
                                transactionId: event.transactionHash,
                                tokenAddress: fantomSwanNft.address,
                                metadataUri: nft.metadataUri,
                                imageUri: ""
                            };
                            subscriber.next(mintTransaction);
                            contract.removeAllListeners();
                            subscriber.complete();
                        }
                    });
                });
            })
        );
    }

    signMessage(message: string): Observable<string | undefined> {
        return this.getEthersProvider().pipe(
            map((provider) => provider.getSigner()),
            switchMap((signer) => {
                return from(signer.signMessage(message));
            })
        );
    }

    getUserNFTs() {
        return EMPTY;
    }

    private getEthersProvider(): Observable<ethers.providers.Web3Provider> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const externalProvider = (window as any).ethereum;
        if (!isNil(externalProvider)) {
            if (!isNil(this._ethersProvider)) {
                return of(this._ethersProvider);
            }
            this._ethersProvider = new ethers.providers.Web3Provider(externalProvider);
            return from(this._ethersProvider.send("eth_requestAccounts", [])).pipe(map(() => this._ethersProvider));
        } else {
            return throwError(() => "Ethereum object is not added to window");
        }
    }
}
