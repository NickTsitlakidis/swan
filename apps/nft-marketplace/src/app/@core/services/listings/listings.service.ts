import { BuyListingDto, PageDto, PaginationDto } from "@swan/dto";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ActivateListingDto, CreateListingDto, EntityDto, ListingDto, SubmitListingDto } from "@swan/dto";
import { CoreModule } from "../../core.module";
import { map, Observable } from "rxjs";
import { plainToInstance } from "class-transformer";

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

    public getActiveListings(query: PaginationDto): Observable<PageDto<ListingDto>> {
        return this._httpClient
            .get("/listings/get-active-listings", {
                params: {
                    skip: query.skip,
                    limit: query.limit
                }
            })
            .pipe(
                map((result: any) => {
                    return {
                        count: result.count,
                        items: plainToInstance(ListingDto, result.items as Array<any>)
                    };
                })
            );
    }

    public buyListing(body: BuyListingDto) {
        return this._httpClient.post<EntityDto>("/listings/buy-listing", body);
    }
}
