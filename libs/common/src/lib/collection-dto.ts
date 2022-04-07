import { Blockchains } from "./blockchains";
import { CollectionLinksDto } from "./collection-links-dto";

export class CollectionDto {
    id: string;

    name: string;

    categoryId: string;

    customUrl: string;

    description: string;

    isExplicit: boolean;

    imageUrl: string;

    links: CollectionLinksDto;

    salePercentage: number;

    blockchain: Blockchains;

    paymentToken: string;

    assetsCount: number;
}
