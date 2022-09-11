import { WalletService } from "./wallet-service";
import { from, map, Observable, of, Subject, switchMap, throwError, zip } from "rxjs";
import { WalletEvent } from "./wallet-event";
import { ethers } from "ethers";
import { isNil } from "lodash";
import { CreateNft } from "./create-nft";
import { Injectable } from "@angular/core";
import { ChainsModule } from "./chains.module";
import { NftMintTransactionDto } from "@swan/dto";
import { Erc721Factory, ListingResult, SwanMarketplaceFactory, SwanNftFactory } from "@swan/contracts";
import { CreateListing } from "./create-listing";

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
            switchMap((publicKey) => {
                return zip(of(publicKey), from(this.switchToCorrectNetwork(nft.blockchain.chainId)));
            }),
            switchMap(([publicKey]) => {
                const contract = this._swanNftFactory.create(this._ethersProvider, nft.blockchain.id);
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

    createListing(listing: CreateListing): Observable<string> {
        return this.getEthersProvider().pipe(
            switchMap((provider) => {
                return zip(of(provider), from(this.switchToCorrectNetwork(listing.blockchain.chainId)));
            }),
            switchMap(([provider]) => {
                if (!listing.tokenContractAddress || !listing.tokenId) {
                    return throwError(() => "oops");
                }
                const contract = this._erc721Factory.create(
                    provider,
                    listing.tokenContractAddress,
                    listing.blockchain.id
                );
                return from(contract.approve(listing.tokenId));
            }),
            switchMap(() => {
                const contract = this._swanMarketplaceFactory.create(this._ethersProvider, listing.blockchain.id);
                return of(contract);
            }),
            switchMap((contract) => {
                if (!listing.tokenContractAddress || !listing.tokenId) {
                    return throwError(() => "oops");
                }
                return from(contract.createListing(listing.tokenContractAddress, listing.tokenId, listing.price));
            })
        );
    }

    getListingResult(transactionHash: string, blockchainId: string): Observable<ListingResult> {
        const contract = this._swanMarketplaceFactory.create(this._ethersProvider, blockchainId);
        return from(this._ethersProvider.getSigner().getAddress()).pipe(
            switchMap((address) => from(contract.getListingResult(transactionHash, address)))
        );
    }

    private getEthersProvider(): Observable<ethers.providers.Web3Provider> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const externalProvider = (window as any).ethereum;
        if (!isNil(externalProvider)) {
            if (!isNil(this._ethersProvider)) {
                return of(this._ethersProvider);
            }
            this._ethersProvider = new ethers.providers.Web3Provider(externalProvider, "any");
            return from(this._ethersProvider.send("eth_requestAccounts", [])).pipe(map(() => this._ethersProvider));
        } else {
            return throwError(() => "Ethereum object is not added to window");
        }
    }

    private async switchToCorrectNetwork(chainId: string) {
        const currentNetwork = await this._ethersProvider.getNetwork();
        if (currentNetwork.chainId.toString() === chainId) {
            return;
        }

        return this._ethersProvider.send("wallet_switchEthereumChain", [{ chainId }]);
    }
}
