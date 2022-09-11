import { ethers } from "ethers";

export interface DeployedContract {
    blockchainId: string;
    version: string;
    address: string;
    abi: ethers.ContractInterface;
}
