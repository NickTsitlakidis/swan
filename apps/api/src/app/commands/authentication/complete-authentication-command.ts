import { CompleteAuthenticationDto, SupportedWallets } from "@nft-marketplace/common";

export class CompleteAuthenticationCommand {
    address: string;
    walletType: SupportedWallets;
    signature: string;

    constructor(dto: CompleteAuthenticationDto) {
        this.signature = dto.signature;
        this.walletType = dto.walletType;
        this.address = dto.walletAddress;
    }
}
