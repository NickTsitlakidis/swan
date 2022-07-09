import { Injectable } from "@nestjs/common";
import { MetaplexMetadata } from "@nftstorage/metaplex-auth";
import { Blob } from "buffer";
import { ConfigService } from "@nestjs/config";
import { NftMetadata } from "../../domain/nft/nft-metadata";
import { UploadedFiles } from "./uploaded-files";
import { LogAsyncMethod } from "../../infrastructure/logging";
import { AwsService } from "../aws/aws-service";
import { MetaplexService } from "../metaplex/metaplex-service";

@Injectable()
export class UploaderService {
    constructor(
        private _awsService: AwsService,
        private _metaplexService: MetaplexService,
        private _configService: ConfigService
    ) {}

    @LogAsyncMethod
    async uploadSolanaMetadata(metadata: NftMetadata): Promise<UploadedFiles> {
        const params = {
            Bucket: this._configService.get("S3_BUCKET_UPLOAD"),
            Key: metadata.s3uri.split("/").pop()
        };
        const file = await this._awsService.getS3().getObject(params).promise();
        let blob = new Blob([file.Body as Buffer]);

        const imageFileIPFSId = await this._metaplexService.getMetaplexor().storeBlob(blob as any);

        const imageUri = `https://nftstorage.link/ipfs/${imageFileIPFSId}`;

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

        const data = Buffer.from(JSON.stringify(solanaMetadata));
        blob = new Blob([data as Buffer]);

        const metadataIPFSId = await this._metaplexService.getMetaplexor().storeBlob(blob as any);

        const metadataUri = `https://nftstorage.link/ipfs/${metadataIPFSId}`;
        return {
            metadataIPFSUri: metadataUri,
            imageIPFSUri: imageUri
        };
    }

    /* async uploadEVMMetadata(metadata: NftMetadataDto): Promise<string> {

    } */
}
