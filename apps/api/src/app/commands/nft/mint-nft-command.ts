import { NftMintTransactionDto } from "@swan/dto";

export class MintNftCommand {
    id: string;
    transactionId: string;
    tokenContractAddress: string;
    tokenId: string;
    userId: string;

    static fromDto(userId: string, dto: NftMintTransactionDto): MintNftCommand {
        const command = new MintNftCommand();

        command.id = dto.id;
        command.transactionId = dto.transactionId;
        command.tokenContractAddress = dto.tokenContractAddress;
        if (dto.tokenId) command.tokenId = dto.tokenId;
        command.userId = userId;

        return command;
    }
}
