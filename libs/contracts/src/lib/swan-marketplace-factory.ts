import { ethers } from "ethers";
import { SwanMarketplace } from "@swan/contracts";

export class SwanMarketplaceFactory {
    create(ethersProvider: ethers.providers.JsonRpcProvider, blockchainId: string): SwanMarketplace {
        return new SwanMarketplace(ethersProvider, blockchainId);
    }
}
