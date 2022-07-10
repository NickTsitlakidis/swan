import { Injectable } from "@nestjs/common";
import { MetaplexMetadata } from "@nftstorage/metaplex-auth";
import { Blob } from "buffer";
import { ConfigService } from "@nestjs/config";
import { NftMetadata } from "../../domain/nft/nft-metadata";
import { UploadedFiles } from "./uploaded-files";
import { LogAsyncMethod } from "../../infrastructure/logging";
import { AwsService } from "../aws/aws-service";
import { MetaplexService } from "../metaplex/metaplex-service";
import { EvmMetadata } from "./evm-metadata";

@Injectable()
export class UploaderService {
    constructor(
        private _awsService: AwsService,
        private _metaplexService: MetaplexService,
        private _configService: ConfigService
    ) {}

    @LogAsyncMethod
    async uploadSolanaMetadata(metadata: NftMetadata): Promise<UploadedFiles> {
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

        const metadataUri = await this.uploadMetadata(JSON.stringify(solanaMetadata), metadata.s3uri);
        return {
            metadataIPFSUri: metadataUri,
            imageIPFSUri: imageUri
        };
    }

    async uploadEvmMetadata(metadata: NftMetadata): Promise<UploadedFiles> {
        const imageUri = await this.uploadImage(metadata.s3uri);

        const mapped: EvmMetadata = {
            name: metadata.name,
            image: imageUri,
            description: metadata.description,
            attributes: metadata.attributes?.map((at) => {
                return {
                    trait_type: at.traitType,
                    value: at.value,
                    display_type: at.displayType as any //todo : fix this by restricting types for all chains
                };
            })
        };
        const metadataUri = await this.uploadMetadata(JSON.stringify(mapped), metadata.s3uri);
        return {
            metadataIPFSUri: metadataUri,
            imageIPFSUri: imageUri
        };
    }

    private async uploadMetadata(metadataJson: string, s3Uri: string): Promise<string> {
        const data = Buffer.from(metadataJson);
        const blob = new Blob([data as Buffer]);

        const metadataIPFSId = await this._metaplexService.getMetaplexor().storeBlob(blob as any);
        const params = this.getS3ParamsFromMetadataURI(s3Uri);
        await this._awsService.deleteObjectFromS3(params);

        return `https://nftstorage.link/ipfs/${metadataIPFSId}`;
    }

    private async uploadImage(s3Uri: string): Promise<string> {
        const params = this.getS3ParamsFromMetadataURI(s3Uri);
        const file = await this._awsService.getObjectFromS3(params);
        const blob = new Blob([file.Body as Buffer]);

        const imageFileIPFSId = await this._metaplexService.getMetaplexor().storeBlob(blob as any);

        return `https://nftstorage.link/ipfs/${imageFileIPFSId}`;
    }

    private getS3ParamsFromMetadataURI(s3Uri: string) {
        return {
            Bucket: this._configService.get("S3_BUCKET_UPLOAD"),
            Key: s3Uri.split("/").pop()
        };
    }
}
