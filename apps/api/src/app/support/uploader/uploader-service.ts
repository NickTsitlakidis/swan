import { Injectable } from "@nestjs/common";
import { MetaplexMetadata, NFTStorageMetaplexor } from "@nftstorage/metaplex-auth";
import { SwanWalletService } from "../swan-wallet-service";
import { Blob } from "buffer";
import { ConfigService } from "@nestjs/config";
import * as AWS from "aws-sdk";
import { NftMetadataDto } from "@nft-marketplace/common";
import { NftMetadata } from "../../domain/nft/nft-metadata";
import { UploadedFiles } from "./uploaded-files";

@Injectable()
export class UploaderService {
    private _client: NFTStorageMetaplexor;
    private _s3: AWS.S3;

    constructor(private _swanWalletService: SwanWalletService, private _configService: ConfigService) {
        this._client = NFTStorageMetaplexor.withSecretKey(this._swanWalletService.getSolanaWallet().secretKey, {
            solanaCluster: "devnet",
            mintingAgent: "swan"
        });
        const credentials = new AWS.Credentials(
            this._configService.get("AWS_ACCESS_KEY"),
            this._configService.get("AWS_SECRET_KEY")
        );
        const config = new AWS.Config({ credentials, region: this._configService.get("AWS_REGION") });
        AWS.config.update(config);
        this._s3 = new AWS.S3({ apiVersion: "2006-03-01" });
    }

    async uploadSolanaMetadata(metadata: NftMetadata): Promise<UploadedFiles> {
        const params = {
            Bucket: this._configService.get("S3_BUCKET_UPLOAD"),
            Key: metadata.imageName
        };
        const file = await this._s3.getObject(params).promise();
        let blob = new Blob([file.Body as Buffer]);

        const imageFileIPFSId = await this._client.storeBlob(blob as any);

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

        const metadataIPFSId = await this._client.storeBlob(blob as any);

        const metadataUri = `https://nftstorage.link/ipfs/${metadataIPFSId}`;
        return {
            metadataIPFSUri: metadataUri,
            imageIPFSUri: imageUri
        };
    }

    /* async uploadEVMMetadata(metadata: NftMetadataDto): Promise<string> {

    } */
}
