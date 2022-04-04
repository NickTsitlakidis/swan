import { CollectionLinksDto } from "./collection-links-dto";
import { Blockchains } from "./blockchains";
import { Type } from "class-transformer";

export class CreateCollectionDto {
    @Type(() => CollectionLinksDto)
    links: CollectionLinksDto;

    blockchain: Blockchains;

    name: string;
    categoryId: string;
    customUrl: string;
    description: string;
    isExplicit: boolean;
    imageUrl: string;
    salePercentage: number;
    paymentToken: string;
}
