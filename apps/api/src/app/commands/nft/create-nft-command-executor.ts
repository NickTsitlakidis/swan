import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateNftCommand } from "./create-nft-command";
import { EventStore } from "../../infrastructure/event-store";
import { NftFactory } from "../../domain/nft/nft-factory";
import { UploaderService } from "../../support/uploader/uploader-service";
import { CategoryRepository } from "../../support/categories/category-repository";
import { CollectionViewRepository } from "../../views/collection/collection-view-repository";
import { UserWalletViewRepository } from "../../views/user-wallet/user-wallet-view-repository";
import { BadRequestException } from "@nestjs/common";
import { BlockchainRepository } from "../../support/blockchains/blockchain-repository";
import { NftMetadata } from "../../domain/nft/nft-metadata";
import { UserWalletView } from "../../views/user-wallet/user-wallet-view";
import { CollectionView } from "../../views/collection/collection-view";
import { Category } from "../../support/categories/category";
import { NftDto } from "@nft-marketplace/common";

@CommandHandler(CreateNftCommand)
export class CreateNftCommandExecutor implements ICommandHandler<CreateNftCommand> {

    constructor(private _categoryRepository: CategoryRepository,
                private _blockchainRepository: BlockchainRepository,
                private _collectionRepository: CollectionViewRepository,
                private _walletRepository: UserWalletViewRepository,
                private _uploader: UploaderService,
                private _factory: NftFactory,
                private _eventStore: EventStore) {
    }

    async execute(command: CreateNftCommand): Promise<NftDto> {
        const promises = [
            this._categoryRepository.findById(command.categoryId),
            this._walletRepository.findByUserIdAndWalletIdAndChainId(command.userId, command.walletId, command.chainId),
            this._blockchainRepository.findById(command.chainId)
        ]
        if(command.collectionId) {
            promises.push(this._collectionRepository.findByUserIdAndId(command.userId, command.collectionId));
        }

        const [category, wallet, blockchain, collection] = await Promise.all(promises);

        if(!category || !wallet || !blockchain || (command.collectionId && !collection)) {
            throw new BadRequestException("Missing category, wallet, blockchain or collection");
        }

        const metadata = new NftMetadata();
        metadata.resellPercentage = command.resellPercentage;
        metadata.address = (wallet as UserWalletView).address;
        if(collection) {
            metadata.collection = {
                name: (collection as CollectionView).name,
                family: (collection as CollectionView).family,
            };
        }
        metadata.description = command.description;
        metadata.category = (category as Category).name;
        metadata.attributes = command.attributes;
        metadata.imageType = command.imageType;
        metadata.imageName = command.imageName;
        metadata.maxSupply = command.maxSupply;
        metadata.s3uri = command.s3uri;
        metadata.name = command.name;

        const newNft = this._factory.createNew(command.userId, command.chainId);
        await newNft.uploadFiles(metadata, this._uploader);
        await newNft.commit();
        return new NftDto(newNft.metadataUri, newNft.id);
    }

}