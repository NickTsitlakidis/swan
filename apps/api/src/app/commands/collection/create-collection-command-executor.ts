import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateCollectionCommand } from "./create-collection-command";
import { CollectionFactory } from "../../domain/collection/collection-factory";
import { CollectionViewRepository } from "../../views/collection/collection-view-repository";
import { BadRequestException } from "@nestjs/common";
import { EntityDto } from "@swan/dto";
import { CategoryRepository } from "../../support/categories/category-repository";
import { LogAsyncMethod } from "../../infrastructure/logging";
import { BlockchainRepository } from "../../support/blockchains/blockchain-repository";
import { isNil } from "@nft-marketplace/utils";

@CommandHandler(CreateCollectionCommand)
export class CreateCollectionCommandExecutor implements ICommandHandler<CreateCollectionCommand> {
    constructor(
        private _factory: CollectionFactory,
        private _collectionRepository: CollectionViewRepository,
        private _categoryRepository: CategoryRepository,
        private _blockchainRepository: BlockchainRepository
    ) {}

    @LogAsyncMethod
    async execute(command: CreateCollectionCommand): Promise<EntityDto> {
        const [withName, withCategoryId, chain] = await Promise.all([
            this._collectionRepository.countByName(command.name),
            this._categoryRepository.countById(command.categoryId),
            this._blockchainRepository.findById(command.blockchainId)
        ]);

        if (withName > 0) {
            throw new BadRequestException(`A collection with name ${command.name} already exists`);
        }

        if (withCategoryId === 0) {
            throw new BadRequestException(`No category found with id ${command.categoryId}`);
        }

        if (isNil(chain)) {
            throw new BadRequestException("Blockchain not found");
        }

        if (chain.mainTokenSymbol !== command.paymentToken) {
            throw new BadRequestException("Token doesn't match with blockchain");
        }

        if (command.customUrl) {
            const withUrl = await this._collectionRepository.countByCustomUrl(command.customUrl);
            if (withUrl > 0) {
                throw new BadRequestException(`A collection with url ${command.customUrl} already exists`);
            }
        }

        const newCollection = this._factory.createNew(command);
        await newCollection.commit();

        return new EntityDto(newCollection.id, newCollection.version);
    }
}
