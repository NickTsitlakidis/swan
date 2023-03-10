import { WalletDto } from "./wallet-dto";
import { BlockchainDto } from "./blockchain-dto";
import { Type } from "class-transformer";

export class BlockchainWalletDto {
    @Type(() => BlockchainDto)
    blockchain: BlockchainDto;
    group: string;
    mainTokenName: string;
    mainTokenSymbol: string;
    isTestNetwork: boolean;
    rpcUrl: string;
    scanSiteUrl: string;
    @Type(() => BlockchainDto)
    wallets: Array<WalletDto>;

    constructor(
        blockchain: BlockchainDto,
        mainTokenName: string,
        mainTokenSymbol: string,
        isTestNetwork: boolean,
        rpcUrl: string,
        scanSiteUrl: string,
        wallets: Array<WalletDto>,
        group: string
    ) {
        this.blockchain = blockchain;
        this.mainTokenName = mainTokenName;
        this.mainTokenSymbol = mainTokenSymbol;
        this.isTestNetwork = isTestNetwork;
        this.rpcUrl = rpcUrl;
        this.scanSiteUrl = scanSiteUrl;
        this.wallets = wallets;
        this.group = group;
    }
}
