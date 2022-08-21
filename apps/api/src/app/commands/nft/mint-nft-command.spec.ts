import { NftMintTransactionDto } from "@swan/dto";
import { MintNftCommand } from "./mint-nft-command";

test("fromDto - maps properties to new MintNftCommand", () => {
    const id = "dto-id";
    const transactionId = "dto-transactionId";
    const tokenAddress = "dto-tokenAddress";
    const tokenId = "dto-tokenId";
    const userId = "user-1";

    const dto = new NftMintTransactionDto(id, transactionId, tokenAddress, tokenId);

    const command = MintNftCommand.fromDto(userId, dto);

    expect(command.id).toBe(dto.id);
    expect(command.transactionId).toBe(dto.transactionId);
    expect(command.tokenAddress).toBe(dto.tokenAddress);
    expect(command.tokenId).toBe(dto.tokenId);
    expect(command.userId).toBe(userId);
});
