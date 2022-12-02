import { ethers } from "ethers";
import { Erc721Contract } from "./erc721-contract";
import { SwanMarketplaceContract } from "./swan-marketplace-contract";
import { SwanNftContract } from "./swan-nft-contract";

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
