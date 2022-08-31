import { ethers } from "ethers";
import { Erc721, EvmChains } from "@swan/contracts";

export class Erc721Factory {
    create(
        ethersProvider: ethers.providers.JsonRpcProvider,
        address: string,
        evmChain: EvmChains,
        usingTestnet: boolean
    ): Erc721 {
        return new Erc721(ethersProvider, address, evmChain, usingTestnet);
    }
}
