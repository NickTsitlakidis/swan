import { NftMintTransactionDto } from "@nft-marketplace/common";

export class MintNftCommand {
    id: string;
    transactionId: string;
    tokenAddress: string;
    tokenId: string;
    userId: string;

    static fromDto(userId: string, dto: NftMintTransactionDto): MintNftCommand {
        const command = new MintNftCommand();

        command.id = dto.id;
        command.transactionId = dto.transactionId;
        command.tokenAddress = dto.tokenAddress;
        command.tokenId = dto.tokenId;
        command.userId = userId;

        return command;
    }
}
