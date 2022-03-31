import { CollectionLinksDto } from "../collection-links-dto";
import { Blockchains } from "../blockchains";

export interface CollectionDescriptor {
    name: string;
    description: string;
    isExplicit: boolean;
    imageUrl: string;
    categoryId: string;
    customUrl: string;
    links: CollectionLinksDto;
    salePercentage: number;
    blockchain: Blockchains;
    paymentToken: string;
}
