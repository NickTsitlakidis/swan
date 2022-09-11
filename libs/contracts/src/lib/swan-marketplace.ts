import { ContractTransaction, ethers } from "ethers";
import { FANTOM_MARKETPLACE_TEST_NET } from "./abi/swan-marketplace-fantom-testnet";
import { FANTOM_MARKETPLACE_MAIN_NET } from "./abi/swan-marketplace-fantom-mainnet";
import { firstValueFrom, from, map, mergeMap, Observable, of, skipWhile, take, tap, zip } from "rxjs";
import { ListingResult } from "./listing-result";
import { DeployedContract } from "./deployed-contract";
import { isNil } from "lodash";

export class SwanMarketplace {
    private readonly _contractInstance: ethers.Contract;
    private readonly _address: string;
    private readonly _supportedContracts: Array<DeployedContract>;

    constructor(private readonly _ethersProvider: ethers.providers.JsonRpcProvider, blockchainId: string) {
        this._supportedContracts = [FANTOM_MARKETPLACE_TEST_NET, FANTOM_MARKETPLACE_MAIN_NET];
        this._address = this.getAddress(blockchainId);
        this._contractInstance = new ethers.Contract(this._address, this.getAbi(blockchainId), this._ethersProvider);
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
        const eventFilter = this._contractInstance.filters["ListingCreated"](signerAddress);

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

    private getAbi(blockchainId: string): ethers.ContractInterface {
        const found = this._supportedContracts.find((contract) => contract.blockchainId === blockchainId);

        if (isNil(found)) {
            throw new Error(`Blockchain with id ${blockchainId} is unsupported`);
        }

        return found.abi;
    }

    private getAddress(blockchainId: string): string {
        const found = this._supportedContracts.find((contract) => contract.blockchainId === blockchainId);

        if (isNil(found)) {
            throw new Error(`Blockchain with id ${blockchainId} is unsupported`);
        }

        return found.address;
    }
}
