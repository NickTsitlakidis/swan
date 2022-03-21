import {
    Blockchains,
    StartSignatureAuthenticationDto,
    SupportedWallets
} from "@nft-marketplace/common";

export class StartSignatureAuthenticationCommand {
    address: string;
    blockchain: Blockchains;
    wallet: SupportedWallets;

    constructor(dto: StartSignatureAuthenticationDto) {
        this.address = dto.walletAddress;
        this.blockchain = dto.blockchain;
        this.wallet = dto.wallet;
    }
}
