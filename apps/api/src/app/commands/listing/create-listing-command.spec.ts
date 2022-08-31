import { CreateListingDto } from "@swan/dto";
import { CreateListingCommand } from "./create-listing-command";

test("fromDto - maps properties to new CreateListingCommand", () => {
    const dto = new CreateListingDto();
    dto.blockchainId = "the-chain";
    dto.categoryId = "the-category";
    dto.chainTokenId = "2321";
    dto.nftId = "444";
    dto.price = 34;
    dto.tokenContractAddress = "contract";
    dto.nftAddress = "nftAddress";

    const mapped = CreateListingCommand.fromDto(dto, "user");
    expect(mapped.blockchainId).toBe(dto.blockchainId);
    expect(mapped.categoryId).toBe(dto.categoryId);
    expect(mapped.chainTokenId).toBe(dto.chainTokenId);
    expect(mapped.nftId).toBe(dto.nftId);
    expect(mapped.price).toBe(dto.price);
    expect(mapped.tokenContractAddress).toBe(dto.tokenContractAddress);
    expect(mapped.nftAddress).toBe(dto.nftAddress);
    expect(mapped.userId).toBe("user");
});
