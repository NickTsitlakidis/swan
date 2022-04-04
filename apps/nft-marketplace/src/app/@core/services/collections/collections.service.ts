import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AvailabilityDto, CategoryDto, CreateCollectionDto, EntityDto } from "@nft-marketplace/common";

@Injectable()
export class CollectionsService {
    constructor(private _httpClient: HttpClient) {}

    public getCategories() {
        return this._httpClient.get<CategoryDto[]>("/system/categories");
    }

    public validateCollectioName(name: string) {
        return this._httpClient.get<AvailabilityDto>("/collections/name-availability", { params: { name } });
    }

    public validateCollectioUrl(url: string) {
        return this._httpClient.get<AvailabilityDto>("/collections/url-availability", { params: { url } });
    }

    public createCollection(body: CreateCollectionDto) {
        return this._httpClient.post<EntityDto>("/collections/create-collection", body);
    }
}
