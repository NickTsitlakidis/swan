import { Injectable } from "@nestjs/common";
import { MetaplexMetadata } from "@nftstorage/metaplex-auth";
import { ConfigService } from "@nestjs/config";
import { AwsService } from "./../aws/aws-service";
import { NftMetadata } from "../../domain/nft/nft-metadata";
import { MetaplexService } from "../metaplex/metaplex-service";
import { UploadedFiles } from "./uploaded-files";
import { BlockchainActions } from "./blockchain-actions";
import { ChainNft } from "./chain-nft";
import { HttpService } from "@nestjs/axios";
import { CategoryRepository } from "../categories/category-repository";
import { CategoryByFileType } from "./category-by-file-type";

@Injectable()
export class SolanaActionsService extends BlockchainActions {
    constructor(
        awsService: AwsService,
        configService: ConfigService,
        metaplexService: MetaplexService,
        httpService: HttpService,
        categoryRepository: CategoryRepository
    ) {
        super(awsService, configService, metaplexService, httpService, categoryRepository);
    }

    async getUserNfts(pubKey: string): Promise<ChainNft[]> {
        const metaplexData = await this.metaplexService.getUserNFTs(pubKey);
        const getFilesCategory: CategoryByFileType[] = [];
        for (const nft of metaplexData) {
            getFilesCategory.push({
                animation_url: nft.animation_url,
                image: nft.image
            });
        }
        const foundCategories = await this.getCategoriesDto(getFilesCategory);
        const data = metaplexData.map((nft, index) => {
            const metaplex: ChainNft = { ...nft, categoryId: foundCategories[index]?.id };
            return metaplex;
        });

        return data;
    }

    async uploadMetadata(metadata: NftMetadata): Promise<UploadedFiles> {
        const imageUri = await this.uploadImage(metadata.s3uri);

        const category = metadata.category;
        const walletAddress = metadata.address;
        const solanaMetadata: MetaplexMetadata = {
            collection: metadata.collection,
            name: metadata.name,
            attributes: metadata.attributes?.map((data) => {
                return {
                    trait_type: data.traitType,
                    display_type: data.displayType,
                    value: data.value
                };
            }),
            description: metadata.description,
            seller_fee_basis_points: metadata.resellPercentage,
            image: imageUri,
            properties: {
                files: [
                    {
                        uri: imageUri,
                        type: metadata.imageType
                    }
                ],
                category,
                creators: [
                    {
                        address: walletAddress,
                        share: 100
                    }
                ]
            }
        };

        const metadataUri = await this.uploadMetadataToStorage(JSON.stringify(solanaMetadata), metadata.s3uri);
        return {
            metadataIPFSUri: metadataUri,
            imageIPFSUri: imageUri
        };
    }
}
