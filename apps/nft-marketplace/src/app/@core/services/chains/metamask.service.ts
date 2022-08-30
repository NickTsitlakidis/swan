import { WalletService } from "./wallet-service";
import { from, map, Observable, of, Subject, switchMap, throwError, zip } from "rxjs";
import { WalletEvent } from "./wallet-event";
import { ethers } from "ethers";
import { isNil } from "lodash";
import { CreateNft } from "./nft";
import { Injectable } from "@angular/core";
import { ChainsModule } from "./chains.module";
import { NftMintTransactionDto } from "@swan/dto";
import { Erc721Factory, EvmChains, ListingResult, SwanMarketplaceFactory, SwanNftFactory } from "@swan/contracts";
import { mergeMap } from "rxjs/operators";

@Injectable({
    providedIn: ChainsModule
})
export class MetamaskService implements WalletService {
    private _events: Subject<WalletEvent>;
    private _ethersProvider: ethers.providers.Web3Provider;

    constructor(
        private _swanNftFactory: SwanNftFactory,
        private _erc721Factory: Erc721Factory,
        private _swanMarketplaceFactory: SwanMarketplaceFactory
    ) {
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
        return this.getPublicKey().pipe(
            mergeMap((publicKey) => {
                const contract = this._swanNftFactory.create(this._ethersProvider, EvmChains.FANTOM, true);
                return zip(of(contract), from(contract.createItem(publicKey, nft.metadataUri)));
            }),
            map(([contract, result]) => {
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

    createListing(price: number, tokenContractAddress?: string, tokenId?: number): Observable<string> {
        return this.getEthersProvider().pipe(
            mergeMap((provider) => {
                if (!tokenContractAddress || !tokenId) {
                    return throwError(() => "oops");
                }
                const contract = this._erc721Factory.create(provider, tokenContractAddress, EvmChains.FANTOM, true);
                return from(contract.approve(tokenId));
            }),
            mergeMap((approveResult) => {
                const contract = this._swanMarketplaceFactory.create(this._ethersProvider, EvmChains.FANTOM, true);
                return of(contract);
            }),
            mergeMap((contract) => {
                if (!tokenContractAddress || !tokenId) {
                    return throwError(() => "oops");
                }
                return from(contract.createListing(tokenContractAddress, tokenId, price));
            })
        );
    }

    getListingResult(transactionHash: string): Observable<ListingResult> {
        const contract = this._swanMarketplaceFactory.create(this._ethersProvider, EvmChains.FANTOM, true);
        return from(this._ethersProvider.getSigner().getAddress()).pipe(
            mergeMap((address) => from(contract.getListingResult(transactionHash, address)))
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
