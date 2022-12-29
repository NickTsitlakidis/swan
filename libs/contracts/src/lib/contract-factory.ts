import { ethers } from "ethers";
import { Erc721Contract } from "./erc721-contract";
import { SwanMarketplaceContract } from "./swan-marketplace-contract";
import { SwanERC721 } from "./swan-erc-721";

export class ContractFactory {
    createSwanErc721(ethersProvider: ethers.providers.JsonRpcProvider, address: string): SwanERC721 {
        return new SwanERC721(ethersProvider, address);
    }

    createMarketplace(ethersProvider: ethers.providers.JsonRpcProvider, address: string): SwanMarketplaceContract {
        return new SwanMarketplaceContract(ethersProvider, address);
    }

    createExternalErc721(ethersProvider: ethers.providers.JsonRpcProvider, address: string): Erc721Contract {
        return new Erc721Contract(ethersProvider, address);
    }
}
