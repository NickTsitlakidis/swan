import { Injectable } from "@nestjs/common";
import { AvailabilityDto } from "@nft-marketplace/common";
import { CollectionViewRepository } from "../views/collection/collection-view-repository";

@Injectable()
export class CollectionQueryHandler {
    constructor(private _collectionRepository: CollectionViewRepository) {}

    getNameAvailability(name: string): Promise<AvailabilityDto> {
        return this._collectionRepository.countByName(name).then((count) => new AvailabilityDto(count === 0));
    }

    getUrlAvailability(url: string): Promise<AvailabilityDto> {
        return this._collectionRepository.countByCustomUrl(url).then((count) => new AvailabilityDto(count === 0));
    }
}
