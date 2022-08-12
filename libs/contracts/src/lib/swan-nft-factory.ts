import { ethers } from "ethers";
import { EvmChains, SwanNft } from "@swan/contracts";

export class SwanNftFactory {
    create(ethersProvider: ethers.providers.JsonRpcProvider, evmChain: EvmChains, usingTestNet = false): SwanNft {
        return new SwanNft(ethersProvider, evmChain, usingTestNet);
    }
}
