import { ContractTransaction, ethers } from "ethers";
import { FANTOM_TEST_NET } from "./abi/swan-nft-fantom-testnet";
import { FANTOM_MAIN_NET } from "./abi/swan-nft-fantom-mainnet";
import { firstValueFrom, map, Observable, skipWhile, take, tap } from "rxjs";
import { isNil } from "lodash";
import { DeployedContract } from "./deployed-contract";

export class SwanNft {
    private readonly _contractInstance: ethers.Contract;
    private readonly _address: string;
    private readonly _supportedContracts: Array<DeployedContract>;

    constructor(private readonly _ethersProvider: ethers.providers.JsonRpcProvider, blockchainId: string) {
        this._supportedContracts = [FANTOM_MAIN_NET, FANTOM_TEST_NET];
        this._address = this.getAddress(blockchainId);
        this._contractInstance = new ethers.Contract(this._address, this.getAbi(blockchainId), this._ethersProvider);
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
