import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { MetaplexMetadata } from "@nftstorage/metaplex-auth";
import { NftMetadata } from "../../domain/nft/nft-metadata";
import { EvmMetadata } from "../uploader/evm-metadata";
import { UploadedFiles } from "../uploader/uploaded-files";
import { BlockchainActions } from "./blockchain-actions";
import { ConfigService } from "@nestjs/config";
import { AwsService } from "../aws/aws-service";
import { MetaplexService } from "../metaplex/metaplex-service";
import { BlockchainRepository } from "./blockchain-repository";
import { EvmMetadataValidator } from "./evm-metadata-validator";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { CovalentHqResponse } from "./covalent-hq-response";
import { getLogger, LogAsyncMethod } from "../../infrastructure/logging";

@Injectable()
export class EvmActionsService extends BlockchainActions {
    private _logger: Logger;

    constructor(
        awsService: AwsService,
        configService: ConfigService,
        metaplexService: MetaplexService,
        private readonly _httpService: HttpService,
        private readonly _validator: EvmMetadataValidator,
        private readonly _blockchainRepository: BlockchainRepository
    ) {
        super(awsService, configService, metaplexService);
        this._logger = getLogger(EvmActionsService);
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
    async getUserNfts(pubKey: string, blockchainId?: string): Promise<MetaplexMetadata[]> {
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

        const nfts = await firstValueFrom(this._httpService.get<CovalentHqResponse>(url));

        if (nfts.status !== 200) {
            this._logger.error(`Got error response from CovalentHQ API. Status : ${nfts.status}`);
            throw new InternalServerErrorException("Could not retrieve nfts from covalentHQ");
        }

        return nfts.data.data.items
            .filter(
                (contract) => contract.supports_erc?.includes("erc721") || contract.supports_erc?.includes("erc1155")
            )
            .flatMap((contract) => contract.nft_data)
            .filter((nft) => {
                return this._validator.validate(nft.external_data);
            })
            .map((nft) => {
                const metadataNft = nft.external_data;
                const metaplex: MetaplexMetadata = {
                    name: metadataNft.name,
                    image: metadataNft.image,
                    attributes: metadataNft.attributes,
                    description: metadataNft.description,
                    animation_url: metadataNft.animation_url,
                    external_url: metadataNft.external_url,
                    properties: {
                        files: []
                    }
                };
                return metaplex;
            });
    }
}
