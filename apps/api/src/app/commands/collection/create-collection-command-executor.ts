import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateCollectionCommand } from "./create-collection-command";
import { CollectionFactory } from "../../domain/collection/collection-factory";
import { CollectionViewRepository } from "../../views/collection/collection-view-repository";
import { BadRequestException } from "@nestjs/common";
import { EntityDto } from "@nft-marketplace/common";
import { CategoryViewRepository } from "../../views/categories/category-view-repository";
import { LogAsyncMethod } from "../../infrastructure/logging";

@CommandHandler(CreateCollectionCommand)
export class CreateCollectionCommandExecutor implements ICommandHandler<CreateCollectionCommand> {
    constructor(
        private _factory: CollectionFactory,
        private _repository: CollectionViewRepository,
        private _categoryRepository: CategoryViewRepository
    ) {}

    @LogAsyncMethod
    async execute(command: CreateCollectionCommand): Promise<EntityDto> {
        if (command.customUrl) {
            const withUrl = await this._repository.countByCustomUrl(command.customUrl);
            if (withUrl > 0) {
                throw new BadRequestException(`A collection with url ${command.customUrl} already exists`);
            }
        }

        const [withName, withCategoryId] = await Promise.all([
            this._repository.countByName(command.name),
            this._categoryRepository.countById(command.categoryId)
        ]);

        if (withName > 0) {
            throw new BadRequestException(`A collection with name ${command.name} already exists`);
        }

        if (withCategoryId === 0) {
            throw new BadRequestException(`No category found with id ${command.categoryId}`);
        }

        //todo check if the blockchain-token pair is valid

        const newCollection = this._factory.createNew(command);
        await newCollection.commit();

        return new EntityDto(newCollection.id, newCollection.version);
    }
}
