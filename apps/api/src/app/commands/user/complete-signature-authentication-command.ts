import { Blockchains, CompleteSignatureAuthenticationDto } from "@nft-marketplace/common";

export class CompleteSignatureAuthenticationCommand {
    address: string;
    signature: string;
    blockchain: Blockchains;

    constructor(dto: CompleteSignatureAuthenticationDto) {
        this.signature = dto.signature;
        this.address = dto.walletAddress;
        this.blockchain = dto.blockchain;
    }
}
