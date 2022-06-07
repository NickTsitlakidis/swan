import { CollectionLinksDto } from "./collection-links-dto";
import { Type } from "class-transformer";

export class CreateCollectionDto {
    @Type(() => CollectionLinksDto)
    links: CollectionLinksDto;

    blockchainId: string;

    name: string;
    categoryId: string;
    customUrl: string;
    description: string;
    isExplicit: boolean;
    imageUrl: string;
    salePercentage: number;
    paymentToken: string;
}
