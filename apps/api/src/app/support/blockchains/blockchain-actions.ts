import { MetadataValidator } from "./metadata-validator";
import { AxiosResponse, AxiosError } from "axios";
import { CategoryDto } from "@swan/dto";
import { CategoryRepository } from "../categories/category-repository";
import { ConfigService } from "@nestjs/config";
import { MetaplexService } from "../metaplex/metaplex-service";
import { AwsService } from "../aws/aws-service";
import { NftMetadata } from "../../domain/nft/nft-metadata";
import { UploadedFiles } from "./uploaded-files";
import { Blob } from "buffer";
import { ChainNft } from "./chain-nft";
import { HttpService } from "@nestjs/axios";
import { fromBuffer } from "file-type";
import { firstValueFrom } from "rxjs";
import { parallel } from "radash";
import { CategoryByFileType } from "./category-by-file-type";
import { Logger } from "@nestjs/common";
import { getLogger } from "../../infrastructure/logging";

export abstract class BlockchainActions {
    protected logger: Logger;

    protected constructor(
        private _awsService: AwsService,
        protected _configService: ConfigService,
        protected metaplexService: MetaplexService,
        protected readonly httpService: HttpService,
        protected categoryRepository: CategoryRepository,
        protected validator: MetadataValidator
    ) {
        this.logger = getLogger(BlockchainActions);
    }

    abstract uploadMetadata(metadata: NftMetadata): Promise<UploadedFiles>;

    abstract getUserNfts(pubKey: string, blockchainId?: string): Promise<ChainNft[]>;

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

    protected async imageTypeFromURI(url: string, categories: CategoryDto[]): Promise<CategoryDto | undefined> {
        const response: AxiosResponse & AxiosError = await firstValueFrom(
            this.httpService.get(url, {
                responseType: "arraybuffer",
                headers: { Range: `bytes=0-300`, "Content-Type": "application/json" }
            })
        ).catch((e) => e);

        if (!response.data) {
            this.logger.error(`Error retrieving nft with url:"${url}"`);
            return;
        }

        const mimeTypeResponse = await fromBuffer(response.data);
        let mimeType = mimeTypeResponse?.mime;
        if (!mimeType) {
            mimeType = this._checkIfFileIsMultipart(response);
        }
        let category: CategoryDto;
        for (const cat of categories) {
            const regex = new RegExp(`${cat.name.toLocaleLowerCase()}.*`);
            if (regex.test(mimeType)) {
                category = cat;
            }
        }

        return category;
    }

    /* TODO PLACE THEM SOMEWHERE ELSE */
    protected async getCategoriesDto(data: CategoryByFileType[]): Promise<CategoryDto[]> {
        const categories = await this.categoryRepository.findAll();
        const categoriesDto: CategoryDto[] = [];
        for (const cat of categories) {
            const dto = new CategoryDto(cat.name, cat.id, cat.imageUrl);
            categoriesDto.push(dto);
        }

        const resolvedPromises: CategoryDto[] | undefined = await parallel(50, data, async (nft) => {
            const uri = nft.animation_url || nft.image;
            return await this.imageTypeFromURI(uri, categoriesDto);
        });
        return resolvedPromises;
    }

    private _checkIfFileIsMultipart(response: AxiosResponse) {
        if (response.headers["content-type"] === "application/octet-stream") {
            const bufferString = response.data.toString().toLowerCase().replace(/[\r]/g, "");
            const contentRegExp = new RegExp("content-type.*(\\n|$)");
            const matched = bufferString.match(contentRegExp);
            if (matched) {
                return matched[0];
            }
        }
    }
}
