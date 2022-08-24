import { ethers } from "ethers";
import { EvmChains, SwanMarketplace } from "@swan/contracts";

export class SwanMarketplaceFactory {
    create(
        ethersProvider: ethers.providers.JsonRpcProvider,
        evmChain: EvmChains,
        usingTestNet = false
    ): SwanMarketplace {
        return new SwanMarketplace(ethersProvider, evmChain, usingTestNet);
    }
}
