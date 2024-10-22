import { Injectable } from "@nestjs/common";
import { AvailabilityDto, CollectionDto } from "@swan/dto";
import { CollectionViewRepository } from "../views/collection/collection-view-repository";
import { LogAsyncMethod } from "../infrastructure/logging";

@Injectable()
export class CollectionQueryHandler {
    constructor(private _collectionRepository: CollectionViewRepository) {}

    getNameAvailability(name: string): Promise<AvailabilityDto> {
        return this._collectionRepository.countByName(name).then((count) => new AvailabilityDto(count === 0));
    }

    getUrlAvailability(url: string): Promise<AvailabilityDto> {
        return this._collectionRepository.countByCustomUrl(url).then((count) => new AvailabilityDto(count === 0));
    }

    @LogAsyncMethod
    async getCollectionByUserId(userId: string): Promise<CollectionDto[]> {
        const views = await this._collectionRepository.findByUserId(userId);
        const collections = [];
        for (const view of views) {
            const cto = new CollectionDto();
            cto.id = view.id;
            cto.name = view.name;
            cto.blockchainId = view.blockchainId;
            cto.categoryId = view.categoryId;
            collections.push(cto);
        }
        return collections;
    }

    @LogAsyncMethod
    async getById(id: string): Promise<CollectionDto | undefined> {
        const view = await this._collectionRepository.findOne(id);
        const cto = new CollectionDto();
        if (view) {
            cto.id = view.id;
            cto.name = view.name;
            cto.blockchainId = view.blockchainId;
            return cto;
        }
    }
}
