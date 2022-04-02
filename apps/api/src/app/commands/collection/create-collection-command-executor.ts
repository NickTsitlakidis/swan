import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateCollectionCommand } from "./create-collection-command";
import { CollectionFactory } from "../../domain/collection/collection-factory";
import { CollectionViewRepository } from "../../views/collection/collection-view-repository";
import { BadRequestException } from "@nestjs/common";
import { EntityDto } from "@nft-marketplace/common";

@CommandHandler(CreateCollectionCommand)
export class CreateCollectionCommandExecutor implements ICommandHandler<CreateCollectionCommand> {
    constructor(private _factory: CollectionFactory, private _repository: CollectionViewRepository) {}

    async execute(command: CreateCollectionCommand): Promise<EntityDto> {
        const [withUrl, withName] = await Promise.all([
            this._repository.countByCustomUrl(command.customUrl),
            this._repository.countByName(command.name)
        ]);

        if (withName > 0) {
            throw new BadRequestException(`A collection with name ${command.name} already exists`);
        }

        if (withUrl > 0) {
            throw new BadRequestException(`A collection with url ${command.customUrl} already exists`);
        }

        //todo check if the blockchain-token pair is valid

        const newCollection = this._factory.createNew(command);
        await newCollection.commit();

        return new EntityDto(newCollection.id, newCollection.version);
    }
}
