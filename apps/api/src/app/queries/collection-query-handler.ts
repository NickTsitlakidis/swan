import { Injectable } from "@nestjs/common";
import { AvailabilityDto, CollectionDto } from "@nft-marketplace/common";
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
    async fetchOneCollection(id: string): Promise<CollectionDto> {
        const view = await this._collectionRepository.findOne(id);
        let cto = new CollectionDto();
        cto.id = view.id;
        cto.name = view.name;
        cto.blockchainId = view.blockchainId;
        return cto;
    }
}
