import { Blockchains, CompleteSignatureAuthenticationDto } from "@nft-marketplace/common";

export class CompleteWalletAdditionCommand {
    address: string;
    signature: string;
    blockchain: Blockchains;

    constructor(dto: CompleteSignatureAuthenticationDto, public userId: string) {
        this.signature = dto.signature;
        this.address = dto.walletAddress;
        this.blockchain = dto.blockchain;
    }
}
