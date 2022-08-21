import { CompleteSignatureAuthenticationDto } from "@swan/dto";

export class CompleteSignatureAuthenticationCommand {
    address: string;
    signature: string;
    blockchainId: string;

    static fromDto(dto: CompleteSignatureAuthenticationDto): CompleteSignatureAuthenticationCommand {
        const mapped = new CompleteSignatureAuthenticationCommand();
        mapped.address = dto.address;
        mapped.blockchainId = dto.blockchainId;
        mapped.signature = dto.signature;
        return mapped;
    }
}
