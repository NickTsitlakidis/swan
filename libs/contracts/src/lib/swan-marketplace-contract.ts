import { ContractTransaction, ethers } from "ethers";
import { firstValueFrom, from, map, mergeMap, Observable, of, skipWhile, take, tap, zip } from "rxjs";
import { MarketplaceResult } from "./marketplace-result";
import { SwanMarketplace, SwanMarketplace__factory } from "../../../../apps/solidity-contracts/typechain-types";

export class SwanMarketplaceContract {
    private readonly _contractInstance: SwanMarketplace;

    constructor(private readonly _ethersProvider: ethers.providers.JsonRpcProvider, private readonly _address: string) {
        this._contractInstance = SwanMarketplace__factory.connect(this._address, this._ethersProvider);
    }

    get address(): string {
        return this._address;
    }

    async createListing(tokenContractAddress: string, tokenId: number, price: number): Promise<string> {
        const connected = this._contractInstance.connect(this._ethersProvider.getSigner());
        const listingResult: ContractTransaction = await connected.createListing(
            tokenContractAddress,
            tokenId,
            ethers.utils.parseEther(price.toString())
        );
        return listingResult.hash;
    }

    async buyToken(tokenContractAddress: string, tokenId: number, price: number): Promise<string> {
        const connected = this._contractInstance.connect(this._ethersProvider.getSigner());
        const buyResult: ContractTransaction = await connected.buyToken(tokenContractAddress, tokenId, {
            value: ethers.utils.parseEther(price.toString())
        });
        return buyResult.hash;
    }

    async getBuyResult(transactionHash: string, buyerAddress: string): Promise<MarketplaceResult> {
        const eventFilter = this._contractInstance.filters.TokenSold(null, null, buyerAddress);

        const mappedEventObservable = new Observable<any>((subscriber) => {
            this._contractInstance.on(
                eventFilter,
                (listingId, seller, buyer, tokenContractAddress, tokenId, price, event) => {
                    subscriber.next(event);
                }
            );
        }).pipe(
            skipWhile((contractEvent) => contractEvent.transactionHash !== transactionHash),
            take(1),
            mergeMap((contractEvent) => zip(of(contractEvent), from(this._ethersProvider.getBlockNumber()))),
            map(([contractEvent, blockNumber]) => {
                return {
                    blockNumber: blockNumber,
                    chainListingId: contractEvent.args.listingId.toNumber()
                };
            }),
            tap(() => this._contractInstance.removeAllListeners())
        );

        return firstValueFrom(mappedEventObservable);
    }

    async filterForInvalid(toFilter: Array<SwanMarketplace.TokenListingStruct>): Promise<Array<number>> {
        return this._contractInstance.filterForInvalid(toFilter).then((invalid) => {
            return invalid.filter((listingId) => listingId.toNumber() !== 0).map((listingId) => listingId.toNumber());
        });
    }

    async getFeePercentage(): Promise<number> {
        const fee = await this._contractInstance["getFeePercentage"]();
        return fee.toNumber();
    }

    async getListingResult(transactionHash: string, sellerAddress: string): Promise<MarketplaceResult> {
        const eventFilter = this._contractInstance.filters.ListingCreated(sellerAddress);

        const mappedEventObservable = new Observable<any>((subscriber) => {
            this._contractInstance.on(eventFilter, (seller, tokenContractAddress, tokenId, price, listingId, event) => {
                subscriber.next(event);
            });
        }).pipe(
            skipWhile((contractEvent) => contractEvent.transactionHash !== transactionHash),
            take(1),
            mergeMap((contractEvent) => zip(of(contractEvent), from(this._ethersProvider.getBlockNumber()))),
            map(([contractEvent, blockNumber]) => {
                return {
                    blockNumber: blockNumber,
                    chainListingId: contractEvent.args.listingId.toNumber()
                };
            }),
            tap(() => this._contractInstance.removeAllListeners())
        );

        return firstValueFrom(mappedEventObservable);
    }
}
