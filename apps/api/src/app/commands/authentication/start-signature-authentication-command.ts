import { Blockchains, SignatureWallets, StartSignatureAuthenticationDto } from "@nft-marketplace/common";

export class StartSignatureAuthenticationCommand {
    address: string;
    blockchain: Blockchains;
    wallet: SignatureWallets;

    constructor(dto: StartSignatureAuthenticationDto) {
        this.address = dto.walletAddress;
        this.blockchain = dto.blockchain;
        this.wallet = dto.wallet;
    }
}
