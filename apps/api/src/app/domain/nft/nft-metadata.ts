import { NftMetadataAttributeDto } from "@nft-marketplace/common";

export class NftMetadata {
    collection: Collection;
    category: string;
    address: string;

    imageType: string;
    imageName: string;
    s3uri: string;
    name: string;
    description: string;
    resellPercentage: number;
    maxSupply: number;
    attributes: Array<NftMetadataAttributeDto>;
}

export interface Collection {
    name: string;
    family: string;
}