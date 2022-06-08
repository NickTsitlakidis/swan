import { CollectionLinksDto, CreateCollectionDto } from "@nft-marketplace/common";
import { Type } from "class-transformer";

export class CreateCollectionCommand {
    userId: string;
    name: string;
    description: string;
    isExplicit: boolean;
    imageUrl: string;
    categoryId: string;
    customUrl: string;
    salePercentage: number;
    blockchainId: string;
    paymentToken: string;
    links: CollectionLinksDto;

    static fromDto(dto: CreateCollectionDto): CreateCollectionCommand {
        const mapped = new CreateCollectionCommand();
        mapped.blockchainId = dto.blockchainId;
        mapped.categoryId = dto.categoryId;
        mapped.customUrl = dto.customUrl;
        mapped.name = dto.name;
        mapped.imageUrl = dto.imageUrl;
        mapped.isExplicit = dto.isExplicit;
        mapped.description = dto.description;
        mapped.paymentToken = dto.paymentToken;
        mapped.salePercentage = dto.salePercentage;
        mapped.links = dto.links;

        return mapped;
    }
}
