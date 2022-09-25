import { ContractTransaction, ethers } from "ethers";
import { firstValueFrom, map, Observable, skipWhile, take, tap } from "rxjs";
import { ERC721__factory } from "../../../../apps/solidity-contracts/typechain-types";

export class Erc721Contract {
    private readonly _contractInstance;

    constructor(private readonly _ethersProvider: ethers.providers.JsonRpcProvider, private readonly _address: string) {
        this._contractInstance = ERC721__factory.connect(this._address, this._ethersProvider);
    }

    async approve(tokenId: number, marketplaceAddress: string): Promise<ContractTransaction> {
        const connected = this._contractInstance.connect(this._ethersProvider.getSigner());

        const transaction: ContractTransaction = await connected.approve(marketplaceAddress, tokenId);
        const signerAddress = await this._ethersProvider.getSigner().getAddress();

        const eventFilter = this._contractInstance.filters["Approval"](signerAddress);

        const mappedEventObservable = new Observable<any>((subscriber) => {
            this._contractInstance.on(eventFilter, (from, to, amount, event) => {
                subscriber.next(event);
            });
        }).pipe(
            skipWhile((contractEvent) => contractEvent.transactionHash !== transaction.hash),
            take(1),
            map(() => transaction),
            tap(() => this._contractInstance.removeAllListeners())
        );

        return firstValueFrom(mappedEventObservable);
    }

    async getApproved(tokenId: number): Promise<string> {
        return this._contractInstance.getApproved(tokenId);
    }

    tokenURI(tokenId: number): Promise<string> {
        return this._contractInstance.tokenURI(tokenId);
    }
}
