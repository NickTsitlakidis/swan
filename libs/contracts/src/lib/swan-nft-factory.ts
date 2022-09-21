import { ethers } from "ethers";
import { SwanNft } from "@swan/contracts";

export class SwanNftFactory {
    create(ethersProvider: ethers.providers.JsonRpcProvider, blockchainId: string): SwanNft {
        return new SwanNft(ethersProvider, blockchainId);
    }
}
