import { WalletDto } from "@nft-marketplace/common";

export class BlockchainWalletDto {
    blockchainId: string;
    name: string;
    mainTokenName: string;
    mainTokenSymbol: string;
    isTestNetwork: boolean;
    rpcUrl: string;
    chainId: string;
    scanSiteUrl: string;
    wallets: Array<WalletDto>;

    constructor(
        blockchainId: string,
        name: string,
        mainTokenName: string,
        mainTokenSymbol: string,
        isTestNetwork: boolean,
        rpcUrl: string,
        chainId: string,
        scanSiteUrl: string,
        wallets: Array<WalletDto>
    ) {
        this.blockchainId = blockchainId;
        this.name = name;
        this.mainTokenName = mainTokenName;
        this.mainTokenSymbol = mainTokenSymbol;
        this.isTestNetwork = isTestNetwork;
        this.rpcUrl = rpcUrl;
        this.chainId = chainId;
        this.scanSiteUrl = scanSiteUrl;
        this.wallets = wallets;
    }
}
