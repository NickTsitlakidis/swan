import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { MetaplexMetadata } from "@nftstorage/metaplex-auth";
import { NftMetadata } from "../../domain/nft/nft-metadata";
import { EvmMetadata } from "../uploader/evm-metadata";
import { UploadedFiles } from "../uploader/uploaded-files";
import { BlockchainActions } from "./blockchain-actions";
import { ConfigService } from "@nestjs/config";
import { AwsService } from "../aws/aws-service";
import { MetaplexService } from "../metaplex/metaplex-service";
import { EvmNftContractRepository } from "../evm-nft-contracts/evm-nft-contract-repository";
import { ethers } from "ethers";
import { BlockchainRepository } from "./blockchain-repository";
import { EvmMetadataValidator } from "./evm-metadata-validator";
import { Erc721 } from "@swan/contracts";
import { HttpService } from "@nestjs/axios";

@Injectable()
export class EvmActionsService extends BlockchainActions {
    constructor(
        awsService: AwsService,
        configService: ConfigService,
        metaplexService: MetaplexService,
        private readonly _httpService: HttpService,
        private readonly _validator: EvmMetadataValidator,
        private readonly _blockchainRepository: BlockchainRepository,
        private readonly _contractsRepository: EvmNftContractRepository
    ) {
        super(awsService, configService, metaplexService);
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

    async getUserNfts(pubKey: string, blockchainId?: string): Promise<MetaplexMetadata[]> {
        if (!blockchainId) {
            throw new InternalServerErrorException("Missing blockchain id");
        }

        const blockchain = await this._blockchainRepository.findById(blockchainId);

        if (!blockchain) {
            throw new InternalServerErrorException("Missing blockchain");
        }

        const provider = new ethers.providers.JsonRpcProvider(blockchain.rpcUrl);

        const contracts = await this._contractsRepository.findByBlockchainId(blockchainId);
        const addresses = contracts.map((contract) => contract.address);

        const erc721Contract = new Erc721(provider, addresses[0]);

        const howMany: number = await erc721Contract.balanceOf(pubKey);

        const nftIds: number[] = [];
        for (let i = 0; i < howMany; i++) {
            const nftId: number = await erc721Contract.tokenOfOwnerByIndex(pubKey, i);
            nftIds.push(nftId);
        }

        const promises = [];
        for (let i = 0; i < nftIds.length; i++) {
            const uri: string = await erc721Contract.tokenURI(nftIds[i]);
            const url = uri.replace("ipfs://", "https://cloudflare-ipfs.com/ipfs/");
            promises.push(this._httpService.get(url));
        }

        const nfts = await Promise.all(promises).then((nfts) =>
            nfts.map((nft) => nft.data).filter((mapped) => this._validator.validate(mapped))
        );

        return nfts.map((nft) => {
            const metaplex: MetaplexMetadata = {
                name: nft.name,
                image: nft.image,
                attributes: nft.attributes,
                description: nft.description,
                animation_url: nft.animation_url,
                external_url: nft.external_url,
                properties: {
                    files: []
                }
            };
            return metaplex;
        });
    }
}
