import { CollectionLinksDto, CreateCollectionDto } from "@swan/dto";
import { CreateCollectionCommand } from "./create-collection-command";

test("fromDto - maps properties to new CreateCollectionCommand", () => {
    const dto = new CreateCollectionDto();
    dto.blockchainId = "the-chain";
    dto.categoryId = "the-category";
    dto.name = "named";
    dto.description = "described";
    dto.customUrl = "a url here please";
    dto.logoImageUrl = "an image url?";
    dto.isExplicit = true;
    dto.links = new CollectionLinksDto();
    dto.links.discord = "disc";
    dto.links.medium = "med";
    dto.links.instagram = "insta";
    dto.links.website = "web";
    dto.links.telegram = "gram";
    dto.paymentToken = "token";
    dto.salePercentage = 34;

    const mapped = CreateCollectionCommand.fromDto(dto);
    expect(mapped.blockchainId).toBe(dto.blockchainId);
    expect(mapped.categoryId).toBe(dto.categoryId);
    expect(mapped.name).toBe(dto.name);
    expect(mapped.customUrl).toBe(dto.customUrl);
    expect(mapped.logoImageUrl).toBe(dto.logoImageUrl);
    expect(mapped.description).toBe(dto.description);
    expect(mapped.isExplicit).toBe(dto.isExplicit);
    expect(mapped.salePercentage).toBe(dto.salePercentage);
    expect(mapped.paymentToken).toBe(dto.paymentToken);
    expect(mapped.links).toEqual(dto.links);
});
