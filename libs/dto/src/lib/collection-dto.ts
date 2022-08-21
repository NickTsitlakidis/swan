import { Type } from "class-transformer";
import { CollectionLinksDto } from "./collection-links-dto";

export class CollectionDto {
    id: string;

    name: string;

    categoryId: string;

    customUrl: string;

    description: string;

    isExplicit: boolean;

    imageUrl: string;

    @Type(() => CollectionLinksDto)
    links: CollectionLinksDto;

    salePercentage: number;

    blockchainId: string;

    paymentToken: string;

    assetsCount: number;
}
