import { Blockchains, CollectionDescriptor, CollectionLinksDto } from "@nft-marketplace/common";

export class CreateCollectionCommand implements CollectionDescriptor {
    userId: string;
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
