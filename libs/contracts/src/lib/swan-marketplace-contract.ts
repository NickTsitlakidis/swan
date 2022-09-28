import { ContractTransaction, ethers } from "ethers";
import { firstValueFrom, from, map, mergeMap, Observable, of, skipWhile, take, tap, zip } from "rxjs";
import { ListingResult } from "./listing-result";
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
        const listingResult: ContractTransaction = await connected.createListing(tokenContractAddress, tokenId, price);
        return listingResult.hash;
    }

    async buyToken(tokenContractAddress: string, tokenId: number, price: number): Promise<string> {
        const connected = this._contractInstance.connect(this._ethersProvider.getSigner());
        const buyResult: ContractTransaction = await connected["buyToken"](tokenContractAddress, tokenId, {
            value: ethers.utils.parseEther(price.toString())
        });
        return buyResult.hash;
    }

    async getFeePercentage(): Promise<number> {
        const fee = await this._contractInstance["getFeePercentage"]();
        return fee.toNumber();
    }

    async getListingResult(transactionHash: string, signerAddress: string): Promise<ListingResult> {
        const eventFilter = this._contractInstance.filters["ListingCreated"](signerAddress);

        const mappedEventObservable = new Observable<any>((subscriber) => {
            this._contractInstance.on(eventFilter, (seller, tokenContractAddress, tokenId, price, listingId, event) => {
                console.log("Got ListingCreated event from chain");
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
