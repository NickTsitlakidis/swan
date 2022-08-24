import { BigNumber, ContractTransaction, ethers } from "ethers";
import { abi } from "./abi/enumerable-erc721";
import { firstValueFrom, from, map, mergeMap, Observable, of, skipWhile, take, tap, zip } from "rxjs";

export class Erc721 {
    private readonly _contractInstance: ethers.Contract;

    constructor(private readonly _ethersProvider: ethers.providers.JsonRpcProvider, private readonly _address: string) {
        this._contractInstance = new ethers.Contract(this._address, abi, this._ethersProvider);
    }

    balanceOf(ownerAddress: string): Promise<number> {
        return this._contractInstance["balanceOf"](ownerAddress);
    }

    async approve(marketplaceContractAddress: string, tokenId: number): Promise<ContractTransaction> {
        const connected = this._contractInstance.connect(this._ethersProvider.getSigner());
        const transaction: ContractTransaction = await connected["approve"](marketplaceContractAddress, tokenId);
        const signerAddress = await this._ethersProvider.getSigner().getAddress();

        const mappedEventObservable = this.streamEvents("Approval", signerAddress).pipe(
            skipWhile((contractEvent) => contractEvent.transactionHash !== transaction.hash),
            take(1),
            map(() => {
                return transaction;
            }),
            tap(() => {
                this.removeEventListeners();
            })
        );

        return firstValueFrom(mappedEventObservable);
    }

    tokenOfOwnerByIndex(ownerAddress: string, index: number): Promise<number> {
        return this._contractInstance["tokenOfOwnerByIndex"](ownerAddress, index).then((result: BigNumber) =>
            result.toNumber()
        );
    }

    streamEvents(eventName: string, address: string): Observable<any> {
        const filter = this._contractInstance.filters[eventName](address);

        return new Observable<any>((subscriber) => {
            this._contractInstance.on(filter, (from, to, amount, event) => {
                subscriber.next(event);
            });
        });
    }

    removeEventListeners() {
        this._contractInstance.removeAllListeners();
    }

    tokenURI(tokenId: number): Promise<string> {
        return this._contractInstance["tokenURI"](tokenId);
    }
}
