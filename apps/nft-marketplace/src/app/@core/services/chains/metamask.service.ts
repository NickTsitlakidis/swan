import { WalletService } from "./wallet-service";
import { from, map, Observable, of, Subject, switchMap, throwError, zip } from "rxjs";
import { WalletEvent } from "./wallet-event";
import { ethers } from "ethers";
import { isNil } from "lodash";
import { CreateNft } from "./create-nft";
import { Injectable } from "@angular/core";
import { ChainsModule } from "./chains.module";
import { BlockchainDto, ListingDto, NftMintTransactionDto } from "@swan/dto";
import { ContractFactory, ListingResult } from "@swan/contracts";
import { CreateListing } from "./create-listing";

@Injectable({
    providedIn: ChainsModule
})
export class MetamaskService implements WalletService {
    private _events: Subject<WalletEvent>;
    private _ethersProvider: ethers.providers.Web3Provider;

    constructor(private _contractFactory: ContractFactory) {
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
                return zip(of(publicKey), from(this.switchNetwork(nft.blockchain.chainId)));
            }),
            switchMap(([publicKey]) => {
                if (isNil(nft.contract)) {
                    return throwError(() => "Contract is required on EVM mint");
                }

                const contract = this._contractFactory.createSwanErc721(
                    this._ethersProvider,
                    nft.contract.deploymentAddress
                );
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
        if (isNil(listing.marketplaceContract) || isNil(listing.tokenContractAddress)) {
            return throwError(() => "Evm listings require contract information");
        }

        return this.getEthersProvider().pipe(
            switchMap((provider) => {
                return zip(of(provider), from(this.switchNetwork(listing.blockchain.chainId)));
            }),
            switchMap(() => {
                if (!listing.tokenContractAddress || !listing.tokenId) {
                    return throwError(() => "oops");
                }

                const externalERC721Contract = this._contractFactory.createExternalErc721(
                    this._ethersProvider,
                    listing.tokenContractAddress
                );
                return from(
                    externalERC721Contract.approve(
                        listing.tokenId,
                        listing.marketplaceContract?.deploymentAddress as string
                    )
                );
            }),
            switchMap(() => {
                if (!listing.tokenContractAddress || !listing.tokenId) {
                    return throwError(() => "oops");
                }

                const marketplaceContract = this._contractFactory.createMarketplace(
                    this._ethersProvider,
                    listing.marketplaceContract?.deploymentAddress as string
                );

                return from(
                    marketplaceContract.createListing(listing.tokenContractAddress, listing.tokenId, listing.price)
                );
            })
        );
    }

    getListingResult(transactionHash: string, marketplaceContractAddress: string): Observable<ListingResult> {
        const marketplaceContract = this._contractFactory.createMarketplace(
            this._ethersProvider,
            marketplaceContractAddress
        );
        return from(this._ethersProvider.getSigner().getAddress()).pipe(
            switchMap((address) => from(marketplaceContract.getListingResult(transactionHash, address)))
        );
    }

    buyToken(listing: ListingDto, blockchain: BlockchainDto, marketplaceContractAddress: string): Observable<string> {
        if (isNil(blockchain)) {
            return throwError(() => "Blockchain info is required in evm");
        }

        return this.getEthersProvider().pipe(
            switchMap((provider) => {
                return zip(of(provider), from(this.switchNetwork(blockchain.chainId)));
            }),
            switchMap(() => {
                const contract = this._contractFactory.createMarketplace(
                    this._ethersProvider,
                    marketplaceContractAddress
                );
                return from(
                    contract.buyToken(
                        listing.tokenContractAddress as string,
                        listing.chainTokenId as number,
                        listing.price
                    )
                );
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
            this._ethersProvider = new ethers.providers.Web3Provider(externalProvider, "any");
            return from(this._ethersProvider.send("eth_requestAccounts", [])).pipe(map(() => this._ethersProvider));
        } else {
            return throwError(() => "Ethereum object is not added to window");
        }
    }

    private async switchNetwork(chainId: string) {
        const currentNetwork = await this._ethersProvider.getNetwork();
        if (currentNetwork.chainId.toString() === chainId) {
            return;
        }

        return this._ethersProvider.send("wallet_switchEthereumChain", [{ chainId }]);
    }
}
