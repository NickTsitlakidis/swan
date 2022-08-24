import { ContractTransaction, ethers } from "ethers";
import { EvmChains } from "@swan/contracts";
import { InternalServerErrorException } from "@nestjs/common";
import { FANTOM_MARKETPLACE_TEST_NET } from "./abi/swan-marketplace-fantom-testnet";
import { FANTOM_MARKETPLACE_MAIN_NET } from "./abi/swan-marketplace-fantom-mainnet";
import { firstValueFrom, from, map, mergeMap, Observable, of, skipWhile, take, tap, zip } from "rxjs";
import { ListingResult } from "./listing-result";

export class SwanMarketplace {
    private readonly _contractInstance: ethers.Contract;
    private readonly _address: string;

    constructor(
        private readonly _ethersProvider: ethers.providers.JsonRpcProvider,
        private readonly _evmChain: EvmChains,
        private readonly _usingTestNet = false
    ) {
        this._address = this.getAddress(this._evmChain, this._usingTestNet);
        this._contractInstance = new ethers.Contract(
            this._address,
            this.getAbi(this._evmChain, this._usingTestNet),
            this._ethersProvider
        );
    }

    async createListing(tokenContractAddress: string, tokenId: number, price: number): Promise<string> {
        const connected = this._contractInstance.connect(this._ethersProvider.getSigner());
        const listingResult: ContractTransaction = await connected["createListing"](
            tokenContractAddress,
            tokenId,
            price
        );
        return listingResult.hash;
    }

    async getListingResult(transactionHash: string, signerAddress: string): Promise<ListingResult> {
        const mappedEventObservable = this.streamEvents("ListingCreated", signerAddress).pipe(
            skipWhile((contractEvent) => contractEvent.transactionHash !== transactionHash),
            take(1),
            mergeMap((contractEvent) => zip(of(contractEvent), from(this._ethersProvider.getBlockNumber()))),
            map(([contractEvent, blockNumber]) => {
                return {
                    blockNumber: blockNumber,
                    chainListingId: contractEvent.listingId
                };
            }),
            tap(() => {
                this.removeEventListeners();
            })
        );

        return firstValueFrom(mappedEventObservable);
    }

    removeEventListeners() {
        this._contractInstance.removeAllListeners();
    }

    streamEvents(eventName: string, address: string): Observable<any> {
        const filter = this._contractInstance.filters[eventName]();

        return new Observable<any>((subscriber) => {
            this._contractInstance.on(filter, (from, to, amount, event) => {
                subscriber.next(event);
            });
        });
    }

    private getAbi(chain: EvmChains, usingTestNet: boolean): ethers.ContractInterface {
        switch (chain) {
            case EvmChains.ETHEREUM:
                throw new InternalServerErrorException("Ethereum is unsupported");
            case EvmChains.FANTOM:
                return usingTestNet ? FANTOM_MARKETPLACE_TEST_NET.abi : FANTOM_MARKETPLACE_MAIN_NET.abi;
            case EvmChains.MATIC:
                throw new InternalServerErrorException("MATIC is unsupported");
        }
    }

    private getAddress(chain: EvmChains, usingTestNet: boolean): string {
        switch (chain) {
            case EvmChains.ETHEREUM:
                throw new InternalServerErrorException("Ethereum is unsupported");
            case EvmChains.FANTOM:
                return usingTestNet ? FANTOM_MARKETPLACE_TEST_NET.address : FANTOM_MARKETPLACE_MAIN_NET.address;
            case EvmChains.MATIC:
                throw new InternalServerErrorException("MATIC is unsupported");
        }
    }
}
