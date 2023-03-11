import { Type } from "class-transformer";
import { CollectionLinksDto } from "./collection-links-dto";

export class CollectionDto {
    id: string;
    name: string;
    categoryId: string;
    customUrl: string;
    description: string;
    isExplicit: boolean;
    bannerImageUrl: string;
    logoImageUrl: string;
    blockchainId: string;
    totalItems: number;
    volume: number;
    paymentTokenSymbol: string;

    @Type(() => CollectionLinksDto)
    links: CollectionLinksDto;
}
