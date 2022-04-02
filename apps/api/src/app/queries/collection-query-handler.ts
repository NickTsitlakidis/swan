import {Injectable} from "@nestjs/common";
import {CollectionDto} from "@nft-marketplace/common";
import {CollectionViewRepository} from "../views/collection/collection-view-repository";
import {LogAsyncMethod} from "../infrastructure/logging";

// todo ask (fixed)
// Error: Nest can't resolve dependencies of the CollectionController (EventStore, ?). Please make sure that the argument CollectionQueryHandler at index [1] is available in the RestModule context.
//
// Potential solutions:
//     - If CollectionQueryHandler is a provider, is it part of the current RestModule?
//     - If CollectionQueryHandler is exported from a separate @Module, is that module imported within RestModule?



@Injectable()
export class CollectionQueryHandler {
    constructor(private _repository: CollectionViewRepository) {}

    @LogAsyncMethod
    async fetchOneCollection(id: string): Promise<CollectionDto> {
        const view = await this._repository.findOne(id);
        return new CollectionDto(view.id, view.name, view.blockchain, view.items);
    }

}
