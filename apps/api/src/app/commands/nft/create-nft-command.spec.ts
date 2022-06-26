import { NftMetadataAttributeDto, NftMetadataDto } from "@nft-marketplace/common";
import { CreateNftCommand } from "./create-nft-command";

test("fromDto - maps properties to new CreateNftCommand", () => {
    const dto = new NftMetadataDto();
    dto.walletId = "the-wallet";
    dto.collectionId = "the-collection";
    dto.chainId = "the-chain";
    dto.description = "the-description";
    dto.categoryId = "the-category";
    dto.imageName = "the-image-name";
    dto.imageType = "the-image-type";
    dto.maxSupply = 4;
    dto.resellPercentage = 55;
    dto.s3uri = "the-s3-uri";
    dto.name = "the-name";
    dto.attributes = [new NftMetadataAttributeDto()];
    dto.attributes[0].displayType = "display";
    dto.attributes[0].value = "value";
    dto.attributes[0].traitType = "trait";

    const command = CreateNftCommand.fromDto(dto);

    expect(command.collectionId).toBe(dto.collectionId);
    expect(command.walletId).toBe(dto.walletId);
    expect(command.chainId).toBe(dto.chainId);
    expect(command.description).toBe(dto.description);
    expect(command.categoryId).toBe(dto.categoryId);
    expect(command.imageName).toBe(dto.imageName);
    expect(command.imageType).toBe(dto.imageType);
    expect(command.maxSupply).toBe(dto.maxSupply);
    expect(command.resellPercentage).toBe(dto.resellPercentage);
    expect(command.s3uri).toBe(dto.s3uri);
    expect(command.name).toBe(dto.name);
    expect(command.attributes).toEqual(dto.attributes);
});
