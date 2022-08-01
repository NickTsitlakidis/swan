import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateNftCommand } from "./create-nft-command";
import { NftFactory } from "../../domain/nft/nft-factory";
import { CategoryRepository } from "../../support/categories/category-repository";
import { CollectionViewRepository } from "../../views/collection/collection-view-repository";
import { UserWalletViewRepository } from "../../views/user-wallet/user-wallet-view-repository";
import { BadRequestException } from "@nestjs/common";
import { BlockchainRepository } from "../../support/blockchains/blockchain-repository";
import { NftMetadata } from "../../domain/nft/nft-metadata";
import { NftDto } from "@nft-marketplace/common";
import { isNil } from "lodash";
import { LogAsyncMethod } from "../../infrastructure/logging";

@CommandHandler(CreateNftCommand)
export class CreateNftCommandExecutor implements ICommandHandler<CreateNftCommand> {
    constructor(
        private _categoryRepository: CategoryRepository,
        private _blockchainRepository: BlockchainRepository,
        private _collectionRepository: CollectionViewRepository,
        private _walletRepository: UserWalletViewRepository,
        private _factory: NftFactory
    ) {}

    @LogAsyncMethod
    async execute(command: CreateNftCommand): Promise<NftDto> {
        const [category, wallet, blockchain, collection] = await Promise.all([
            this._categoryRepository.findById(command.categoryId),
            this._walletRepository.findByUserIdAndWalletIdAndChainId(command.userId, command.walletId, command.chainId),
            this._blockchainRepository.findById(command.chainId),
            isNil(command.collectionId)
                ? Promise.resolve(null)
                : this._collectionRepository.findByUserIdAndId(command.userId, command.collectionId)
        ]);

        if (
            isNil(category) ||
            isNil(wallet) ||
            isNil(blockchain) ||
            (!isNil(command.collectionId) && isNil(collection))
        ) {
            throw new BadRequestException("Missing category, wallet, blockchain or collection");
        }

        const metadata = new NftMetadata();
        metadata.resellPercentage = command.resellPercentage;
        metadata.address = wallet.address;
        if (collection) {
            metadata.collection = {
                name: collection.name,
                family: collection.family
            };
        }
        metadata.description = command.description;
        metadata.category = category.name;
        metadata.attributes = command.attributes;
        metadata.imageType = command.imageType;
        metadata.imageName = command.imageName;
        metadata.maxSupply = command.maxSupply;
        metadata.s3uri = command.s3uri;
        metadata.name = command.name;

        const newNft = this._factory.createNew(command.userId, command.chainId);
        await newNft.uploadFiles(metadata);
        await newNft.commit();
        return new NftDto(newNft.metadataUri, newNft.id);
    }
}
