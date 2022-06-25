import { Type } from "class-transformer";
import { NftMetadataAttributeDto } from "./nft-metadata-attribute-dto";

export class NftMetadataDto {
    collectionId: string;
    imageType: string;
    imageName: string;
    categoryId: string;
    s3uri: string;
    name: string;
    description: string;
    resellPercentage: number;
    maxSupply: number;
    chainId: string;
    walletId: string;
    @Type(() => NftMetadataAttributeDto)
    attributes: Array<NftMetadataAttributeDto>;
}
