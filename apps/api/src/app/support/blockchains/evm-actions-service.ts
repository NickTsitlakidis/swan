import { CategoryRepository } from "./../categories/category-repository";
import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { NftMetadata } from "../../domain/nft/nft-metadata";
import { EvmMetadata } from "./evm-metadata";
import { UploadedFiles } from "./uploaded-files";
import { BlockchainActions } from "./blockchain-actions";
import { ConfigService } from "@nestjs/config";
import { AwsService } from "../aws/aws-service";
import { MetaplexService } from "../metaplex/metaplex-service";
import { BlockchainRepository } from "./blockchain-repository";
import { MetadataValidator } from "./metadata-validator";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { CovalentHqResponse, NftData } from "./covalent-hq-response";
import { getLogger, LogAsyncMethod } from "../../infrastructure/logging";
import { ChainNft } from "./chain-nft";
import { CategoryByFileType } from "./category-by-file-type";

@Injectable()
export class EvmActionsService extends BlockchainActions {
    constructor(
        awsService: AwsService,
        configService: ConfigService,
        metaplexService: MetaplexService,
        categoryRepository: CategoryRepository,
        httpService: HttpService,
        validator: MetadataValidator,
        private readonly _blockchainRepository: BlockchainRepository
    ) {
        super(awsService, configService, metaplexService, httpService, categoryRepository, validator);
        this.logger = getLogger(EvmActionsService);
    }

    async uploadMetadata(metadata: NftMetadata): Promise<UploadedFiles> {
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
        const metadataUri = await this.uploadMetadataToStorage(JSON.stringify(mapped), metadata.s3uri);
        return {
            metadataIPFSUri: metadataUri,
            imageIPFSUri: imageUri
        };
    }

    @LogAsyncMethod
    async getUserNfts(pubKey: string, blockchainId?: string): Promise<ChainNft[]> {
        if (!blockchainId) {
            throw new InternalServerErrorException("Missing blockchain id");
        }

        const blockchain = await this._blockchainRepository.findById(blockchainId);

        if (!blockchain) {
            throw new InternalServerErrorException("Missing blockchain");
        }

        const url = `https://api.covalenthq.com/v1/${
            blockchain.chainIdDecimal
        }/address/${pubKey}/balances_v2/?quote-currency=USD&format=JSON&nft=true&no-nft-fetch=false&key=${this._configService.get(
            "COVALENTHQ_KEY"
        )}`;

        const nfts = await firstValueFrom(this.httpService.get<CovalentHqResponse>(url));

        if (nfts.status !== 200) {
            this.logger.error(`Got error response from CovalentHQ API. Status : ${nfts.status}`);
            throw new InternalServerErrorException("Could not retrieve nfts from covalentHQ");
        }

        const validatedNfts = nfts.data.data.items
            .filter(
                (contract) => contract.supports_erc?.includes("erc721") || contract.supports_erc?.includes("erc1155")
            )
            .flatMap((contract) => {
                return contract.nft_data.map((nft) => {
                    const withAddress: NftData & { contractAddress: string } = nft as any;
                    withAddress.contractAddress = contract.contract_address;
                    return withAddress;
                });
            })
            .filter((nft) => {
                return this.validator.validate(nft.external_data);
            });

        const getFilesCategory: CategoryByFileType[] = [];
        for (const nft of validatedNfts) {
            getFilesCategory.push({
                animation_url: nft.external_data.animation_url,
                image: nft.external_data.image
            });
        }
        /*
            TODO get category from metadata for Swan NFTS
         */
        const foundCategories = await this.getCategoriesDto(getFilesCategory);

        return validatedNfts
            .map((nft, index) => {
                const metadataNft = nft.external_data;
                const metaplex: ChainNft = {
                    tokenContractAddress: nft.contractAddress,
                    tokenId: nft.token_id,
                    name: metadataNft.name,
                    image: metadataNft.image,
                    attributes: metadataNft.attributes,
                    description: metadataNft.description,
                    animation_url: metadataNft.animation_url,
                    external_url: metadataNft.external_url,
                    categoryId: foundCategories[index]?.id,
                    properties: {
                        files: []
                    }
                };
                return metaplex;
            })
            .filter((nft) => nft.categoryId);
    }
}
