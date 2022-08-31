import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ActivateListingDto, CreateListingDto, EntityDto, SubmitListingDto } from "@swan/dto";
import { CoreModule } from "../../core.module";

@Injectable({
    providedIn: CoreModule
})
export class ListingsService {
    constructor(private _httpClient: HttpClient) {}

    public createListing(body: CreateListingDto) {
        return this._httpClient.post<EntityDto>("/listings/create-listing", body);
    }

    public submitListing(body: SubmitListingDto) {
        return this._httpClient.post<EntityDto>("/listings/submit-listing", body);
    }

    public activateListing(body: ActivateListingDto) {
        return this._httpClient.post<EntityDto>("/listings/activate-listing", body);
    }
}
