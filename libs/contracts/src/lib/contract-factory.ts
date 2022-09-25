import { ethers } from "ethers";
import { Erc721Contract, SwanMarketplaceContract, SwanNftContract } from "@swan/contracts";

export class ContractFactory {
    createSwanErc721(ethersProvider: ethers.providers.JsonRpcProvider, address: string): SwanNftContract {
        return new SwanNftContract(ethersProvider, address);
    }

    createMarketplace(ethersProvider: ethers.providers.JsonRpcProvider, address: string): SwanMarketplaceContract {
        return new SwanMarketplaceContract(ethersProvider, address);
    }

    createExternalErc721(ethersProvider: ethers.providers.JsonRpcProvider, address: string): Erc721Contract {
        return new Erc721Contract(ethersProvider, address);
    }
}
