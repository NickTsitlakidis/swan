import { BigNumber, ethers } from "ethers";
import { abi } from "./abi/enumerable-erc721";

export class Erc721 {
    private readonly _contractInstance: ethers.Contract;

    constructor(private readonly _ethersProvider: ethers.providers.JsonRpcProvider, private readonly _address: string) {
        this._contractInstance = new ethers.Contract(this._address, abi, this._ethersProvider);
    }

    balanceOf(ownerAddress: string): Promise<number> {
        return this._contractInstance["balanceOf"](ownerAddress);
    }

    tokenOfOwnerByIndex(ownerAddress: string, index: number): Promise<number> {
        return this._contractInstance["tokenOfOwnerByIndex"](ownerAddress, index).then((result: BigNumber) =>
            result.toNumber()
        );
    }

    tokenURI(tokenId: number): Promise<string> {
        return this._contractInstance["tokenURI"](tokenId);
    }
}
