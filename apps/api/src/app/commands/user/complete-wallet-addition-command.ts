import { CompleteSignatureAuthenticationDto } from "@swan/dto";

export class CompleteWalletAdditionCommand {
    address: string;
    signature: string;
    blockchainId: string;
    userId?: string;

    static fromDto(dto: CompleteSignatureAuthenticationDto): CompleteWalletAdditionCommand {
        const mapped = new CompleteWalletAdditionCommand();
        mapped.blockchainId = dto.blockchainId;
        mapped.address = dto.address;
        mapped.signature = dto.signature;
        return mapped;
    }
}
