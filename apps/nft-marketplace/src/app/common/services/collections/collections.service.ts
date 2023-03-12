import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AvailabilityDto, CollectionDto, CreateCollectionDto, EntityDto } from "@swan/dto";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { plainToInstance } from "class-transformer";

@Injectable({
    providedIn: "root"
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

    public getCollectionsByUserId(): Observable<Array<CollectionDto>> {
        return this._httpClient
            .get<Array<unknown>>("/collections/user-collections")
            .pipe(map((collections) => plainToInstance(CollectionDto, collections)));
    }

    public getTrendingCollections(): Observable<Array<CollectionDto>> {
        return this._httpClient
            .get<Array<unknown>>("/collections/trending")
            .pipe(map((collections) => plainToInstance(CollectionDto, collections)));
    }
}
