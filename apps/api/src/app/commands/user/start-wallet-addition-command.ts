import { Blockchains, StartSignatureAuthenticationDto, SupportedWallets } from "@nft-marketplace/common";

export class StartWalletAdditionCommand {
    address: string;
    blockchain: Blockchains;
    wallet: SupportedWallets;

    constructor(dto: StartSignatureAuthenticationDto, public userId: string) {
        this.address = dto.walletAddress;
        this.blockchain = dto.blockchain;
        this.wallet = dto.wallet;
    }
}
