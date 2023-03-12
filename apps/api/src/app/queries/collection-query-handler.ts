import { Injectable, NotFoundException } from "@nestjs/common";
import { AvailabilityDto, CollectionDto, CollectionLinksDto } from "@swan/dto";
import { CollectionViewRepository } from "../views/collection/collection-view-repository";
import { LogAsyncMethod } from "../infrastructure/logging";
import { CollectionView } from "../views/collection/collection-view";

@Injectable()
export class CollectionQueryHandler {
    constructor(private _collectionRepository: CollectionViewRepository) {}

    getNameAvailability(name: string): Promise<AvailabilityDto> {
        return this._collectionRepository.countByName(name).then((count) => new AvailabilityDto(count === 0));
    }

    getUrlAvailability(url: string): Promise<AvailabilityDto> {
        return this._collectionRepository.countByCustomUrl(url).then((count) => new AvailabilityDto(count === 0));
    }

    async getTrending(): Promise<Array<CollectionDto>> {
        const trendingViews = await this._collectionRepository.findTrending();

        return trendingViews.map((view) => this.mapViewToDto(view));
    }

    async getByCategory(): Promise<Array<CollectionDto>> {
        return [];
    }

    @LogAsyncMethod
    async getCollectionByUserId(userId: string): Promise<CollectionDto[]> {
        const views = await this._collectionRepository.findByUserId(userId);
        const collections = [];
        for (const view of views) {
            collections.push(this.mapViewToDto(view));
        }
        return collections;
    }

    @LogAsyncMethod
    async getById(id: string): Promise<CollectionDto> {
        const view = await this._collectionRepository.findOne(id);
        if (view) {
            return this.mapViewToDto(view);
        }

        throw new NotFoundException("Collection was not found");
    }

    private mapViewToDto(view: CollectionView): CollectionDto {
        const dto = new CollectionDto();
        dto.logoImageUrl = view.logoImageUrl;
        dto.bannerImageUrl = view.bannerImageUrl;
        dto.id = view.id;
        dto.name = view.name;
        dto.blockchainId = view.blockchainId;
        dto.categoryId = view.categoryId;
        dto.customUrl = view.customUrl;
        dto.description = view.description;
        dto.volume = view.volume;
        dto.totalItems = view.totalItems;
        dto.paymentTokenSymbol = view.paymentTokenSymbol;
        dto.isExplicit = view.isExplicit;
        dto.links = new CollectionLinksDto();
        dto.links.discord = view.links.discord;
        dto.links.instagram = view.links.instagram;
        dto.links.medium = view.links.medium;
        dto.links.telegram = view.links.telegram;
        dto.links.website = view.links.website;
        return dto;
    }
}
