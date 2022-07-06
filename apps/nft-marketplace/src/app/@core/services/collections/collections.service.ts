import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AvailabilityDto, CollectionDto, CreateCollectionDto, EntityDto } from "@nft-marketplace/common";
import { CoreModule } from "../../core.module";

@Injectable({
    providedIn: CoreModule
})
export class CollectionsService {
    constructor(private _httpClient: HttpClient) {}

    public validateCollectionName(name: string) {
        return this._httpClient.get<AvailabilityDto>("/collections/name-availability", { params: { name } });
    }

    public validateCollectionUrl(url: string) {
        return this._httpClient.get<AvailabilityDto>("/collections/url-availability", { params: { url } });
    }

    public createCollection(body: CreateCollectionDto) {
        return this._httpClient.post<EntityDto>("/collections/create-collection", body);
    }

    public getCollectionByUserId() {
        return this._httpClient.get<CollectionDto[]>("/collections/get-user-collection");
    }
}
