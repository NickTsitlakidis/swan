import { ContractTransaction, ethers } from "ethers";
import { EvmChains } from "./evm-chains";
import { FANTOM_TEST_NET } from "./abi/swan-nft-fantom-testnet";
import { FANTOM_MAIN_NET } from "./abi/swan-nft-fantom-mainnet";
import { firstValueFrom, map, Observable, skipWhile, take, tap } from "rxjs";

export class SwanNft {
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

    get address(): string {
        return this._address;
    }

    getTokensByOwner(ownerAddress: string): Promise<Array<number>> {
        return this._contractInstance["getTokensByOwner"](ownerAddress);
    }

    async createItem(
        receiverAddress: string,
        metadataUri: string
    ): Promise<{ tokenId: number; transactionId: string }> {
        const connected = this._contractInstance.connect(this._ethersProvider.getSigner());
        const mintResult: ContractTransaction = await connected["createItem"](receiverAddress, metadataUri);

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

    private getAbi(chain: EvmChains, usingTestNet: boolean): ethers.ContractInterface {
        switch (chain) {
            case EvmChains.ETHEREUM:
                throw new Error("Ethereum is unsupported");
            case EvmChains.FANTOM:
                return usingTestNet ? FANTOM_TEST_NET.abi : FANTOM_MAIN_NET.abi;
            case EvmChains.MATIC:
                throw new Error("MATIC is unsupported");
        }
    }

    private getAddress(chain: EvmChains, usingTestNet: boolean): string {
        switch (chain) {
            case EvmChains.ETHEREUM:
                throw new Error("Ethereum is unsupported");
            case EvmChains.FANTOM:
                return usingTestNet ? FANTOM_TEST_NET.address : FANTOM_MAIN_NET.address;
            case EvmChains.MATIC:
                throw new Error("MATIC is unsupported");
        }
    }
}
