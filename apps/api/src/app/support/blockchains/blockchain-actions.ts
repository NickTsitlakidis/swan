import { ConfigService } from "@nestjs/config";
import { MetaplexService } from "./../metaplex/metaplex-service";
import { AwsService } from "./../aws/aws-service";
import { NftMetadata } from "../../domain/nft/nft-metadata";
import { UploadedFiles } from "../uploader/uploaded-files";
import { Injectable } from "@nestjs/common";
import { Blob } from "buffer";
import { MetaplexMetadata } from "@nftstorage/metaplex-auth";

@Injectable()
export abstract class BlockchainActions {
    constructor(
        private _awsService: AwsService,
        private _configService: ConfigService,
        protected metaplexService: MetaplexService
    ) {}

    abstract uploadMetadata(metadata: NftMetadata): Promise<UploadedFiles>;

    abstract getUserNfts(pubKey: string): Promise<MetaplexMetadata[]>;

    protected async uploadImage(s3Uri: string): Promise<string> {
        const params = this.getS3ParamsFromMetadataURI(s3Uri);
        const file = await this._awsService.getObjectFromS3(params);
        const blob = new Blob([file.Body as Buffer]);

        const imageFileIPFSId = await this.metaplexService.getMetaplexor().storeBlob(blob as any);

        return `https://nftstorage.link/ipfs/${imageFileIPFSId}`;
    }

    protected getS3ParamsFromMetadataURI(s3Uri: string) {
        return {
            Bucket: this._configService.get("S3_BUCKET_UPLOAD"),
            Key: s3Uri.split("/").pop()
        };
    }

    protected async uploadMetadataToStorage(metadataJson: string, s3Uri: string): Promise<string> {
        const data = Buffer.from(metadataJson);
        const blob = new Blob([data as Buffer]);

        const metadataIPFSId = await this.metaplexService.getMetaplexor().storeBlob(blob as any);
        const params = this.getS3ParamsFromMetadataURI(s3Uri);
        await this._awsService.deleteObjectFromS3(params);

        return `https://nftstorage.link/ipfs/${metadataIPFSId}`;
    }
}
