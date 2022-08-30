import { BigNumber, ContractTransaction, ethers } from "ethers";
import { abi } from "./abi/enumerable-erc721";
import { delay, firstValueFrom, map, Observable, skipWhile, take, tap } from "rxjs";
import { EvmChains } from "./evm-chains";
import { InternalServerErrorException } from "@nestjs/common";
import { FANTOM_MARKETPLACE_TEST_NET } from "./abi/swan-marketplace-fantom-testnet";
import { FANTOM_MARKETPLACE_MAIN_NET } from "./abi/swan-marketplace-fantom-mainnet";

export class Erc721 {
    private readonly _contractInstance: ethers.Contract;
    private readonly _marketplaceAddress: string;

    constructor(
        private readonly _ethersProvider: ethers.providers.JsonRpcProvider,
        private readonly _address: string,
        evmChain: EvmChains,
        usingTestNet = false
    ) {
        this._contractInstance = new ethers.Contract(this._address, abi, this._ethersProvider);
        this._marketplaceAddress = this.getMarketplaceAddress(evmChain, usingTestNet);
    }

    balanceOf(ownerAddress: string): Promise<number> {
        return this._contractInstance["balanceOf"](ownerAddress);
    }

    async approve(tokenId: number): Promise<ContractTransaction> {
        const connected = this._contractInstance.connect(this._ethersProvider.getSigner());

        const transaction: ContractTransaction = await connected["approve"](this._marketplaceAddress, tokenId);
        const signerAddress = await this._ethersProvider.getSigner().getAddress();

        const eventFilter = this._contractInstance.filters["Approval"](signerAddress);

        const mappedEventObservable = new Observable<any>((subscriber) => {
            this._contractInstance.on(eventFilter, (from, to, amount, event) => {
                subscriber.next(event);
                console.log("got approval event", event);
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
        return this._contractInstance["getApproved"](tokenId);
    }

    tokenOfOwnerByIndex(ownerAddress: string, index: number): Promise<number> {
        return this._contractInstance["tokenOfOwnerByIndex"](ownerAddress, index).then((result: BigNumber) =>
            result.toNumber()
        );
    }

    tokenURI(tokenId: number): Promise<string> {
        return this._contractInstance["tokenURI"](tokenId);
    }

    private getMarketplaceAddress(chain: EvmChains, usingTestNet: boolean): string {
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
