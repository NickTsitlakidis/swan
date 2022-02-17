import { SupportedWallets } from "../../domain/supported-wallets";
import { CompleteAuthenticationDto } from "../../api/user/complete-authentication-dto";

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
