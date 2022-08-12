import { WalletService } from "./wallet-service";
import { from, map, Observable, of, Subject, switchMap, throwError } from "rxjs";
import { WalletEvent } from "./wallet-event";
import { ethers } from "ethers";
import { isNil } from "lodash";
import { CreateNft } from "./nft";
import { Injectable } from "@angular/core";
import { ChainsModule } from "./chains.module";
import { NftMintTransactionDto } from "@nft-marketplace/common";
import { EvmChains, SwanNft } from "@swan/contracts";

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

    mint(nft: CreateNft): Observable<NftMintTransactionDto> {
        const contract = new SwanNft(this._ethersProvider, EvmChains.FANTOM, true);

        return this.getPublicKey().pipe(
            switchMap((publicKey) => contract.createItem(publicKey, nft.metadataUri)),
            map((result) => {
                return new NftMintTransactionDto(
                    nft.id,
                    result.transactionId,
                    contract.address,
                    result.tokenId.toString()
                );
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
