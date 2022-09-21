import { ethers } from "ethers";
import { Erc721 } from "@swan/contracts";

export class Erc721Factory {
    create(ethersProvider: ethers.providers.JsonRpcProvider, address: string, blockchainId: string): Erc721 {
        return new Erc721(ethersProvider, address, blockchainId);
    }
}
