import { ContractTransaction, ethers } from "ethers";
import { firstValueFrom, map, Observable, skipWhile, take, tap } from "rxjs";
import { SwanNft, SwanNft__factory } from "../../../../apps/solidity-contracts/typechain-types";

export class SwanNftContract {
    private readonly _contractInstance: SwanNft;

    constructor(private readonly _ethersProvider: ethers.providers.JsonRpcProvider, private readonly _address: string) {
        this._contractInstance = SwanNft__factory.connect(this._address, this._ethersProvider);
    }

    get address(): string {
        return this._address;
    }

    getTokensByOwner(ownerAddress: string): Promise<Array<number>> {
        return this._contractInstance.getTokensByOwner(ownerAddress).then((ids) => ids.map((id) => id.toNumber()));
    }

    async createItem(
        receiverAddress: string,
        metadataUri: string
    ): Promise<{ tokenId: number; transactionId: string }> {
        const connected = this._contractInstance.connect(this._ethersProvider.getSigner());
        const mintResult: ContractTransaction = await connected.createItem(receiverAddress, metadataUri);

        const eventFilter = this._contractInstance.filters["Transfer"](null, receiverAddress);

        const mappedEventObservable = new Observable<any>((subscriber) => {
            this._contractInstance.on(eventFilter, (from, to, amount, event) => {
                subscriber.next(event);
            });
        }).pipe(
            skipWhile((contractEvent) => contractEvent.transactionHash !== mintResult.hash),
            take(1),
            map((contractEvent) => {
                return {
                    tokenId: ethers.BigNumber.from(contractEvent.args[2]).toNumber(),
                    transactionId: contractEvent.transactionHash as string
                };
            }),
            tap(() => this._contractInstance.removeAllListeners())
        );
        return firstValueFrom(mappedEventObservable);
    }
}
