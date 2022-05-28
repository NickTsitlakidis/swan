import { CollectionLinksDto } from "@nft-marketplace/common";
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
    @Type(() => CollectionLinksDto)
    links: CollectionLinksDto;
}
