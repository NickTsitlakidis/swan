import {Injectable} from "@nestjs/common";
import {CollectionDto} from "@nft-marketplace/common";
import {CollectionViewRepository} from "../views/collection/collection-view-repository";
import {LogAsyncMethod} from "../infrastructure/logging";

@Injectable()
export class CollectionQueryHandler {
    constructor(private _repository: CollectionViewRepository) {}

    @LogAsyncMethod
    async fetchOneCollection(id: string): Promise<CollectionDto> {
        const view = await this._repository.findOne(id);
        return new CollectionDto(view.id, view.name, view.blockchain, view.items);
    }

}
