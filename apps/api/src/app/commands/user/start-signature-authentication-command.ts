import { StartSignatureAuthenticationDto } from "@swan/dto";

export class StartSignatureAuthenticationCommand {
    address: string;
    blockchainId: string;
    walletId: string;
    userId: string;

    static fromDto(dto: StartSignatureAuthenticationDto): StartSignatureAuthenticationCommand {
        const mapped = new StartSignatureAuthenticationCommand();
        mapped.address = dto.address;
        mapped.blockchainId = dto.blockchainId;
        mapped.walletId = dto.walletId;
        return mapped;
    }
}
