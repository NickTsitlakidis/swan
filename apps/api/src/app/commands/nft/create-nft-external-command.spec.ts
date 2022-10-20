import { BlockchainDto, CategoryDto, ProfileNftDto } from "@swan/dto";
import { CreateNftExternalCommand } from "./create-nft-external-command";

test("fromDto - maps properties to new CreateNftCommand", () => {
    const dto = new ProfileNftDto();
    const chainDto = new BlockchainDto("chainName", "id", "chainId");
    const categoryDto = new CategoryDto("catName", "catid");

    dto.animationUri = "animationUri";
    dto.blockchain = chainDto;
    dto.category = categoryDto;
    dto.imageUri = "the-imageUri";
    dto.tokenId = "555";
    dto.tokenContractAddress = "the-tokenContractAddress";
    dto.metadataUri = "metadataUri";
    dto.walletId = "the-wallet";

    const command = CreateNftExternalCommand.fromDto(dto, "userId");

    expect(command.imageUri).toBe(dto.imageUri);
    expect(command.categoryId).toBe(dto.category.id);
    expect(command.tokenId).toBe(dto.tokenId);
    expect(command.tokenContractAddress).toBe(dto.tokenContractAddress);
    expect(command.blockchainId).toBe(dto.blockchain.id);
    expect(command.walletId).toBe(dto.walletId);
    expect(command.userId).toBe("userId");
    expect(command.metadataUri).toBe(dto.metadataUri);
});
