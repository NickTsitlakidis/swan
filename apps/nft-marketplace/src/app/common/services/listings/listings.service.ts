import { BuyListingDto, HttpErrorDto, INVALID_LISTING_STATUS, PageDto, PaginationDto } from "@swan/dto";
import { HttpClient, HttpContext, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ActivateListingDto, CreateListingDto, EntityDto, ListingDto, SubmitListingDto } from "@swan/dto";
import { map, Observable, throwError } from "rxjs";
import { plainToInstance } from "class-transformer";
import { SKIP_ERROR_TOAST } from "../../interceptors/http-context-tokens";
import { catchError } from "rxjs/operators";
import { NotificationsService } from "../notifications.service";

@Injectable({
    providedIn: "root"
})
export class ListingsService {
    constructor(private _httpClient: HttpClient, private _notificationsService: NotificationsService) {}

    public createListing(body: CreateListingDto) {
        return this._httpClient.post<EntityDto>("/listings/create-listing", body);
    }

    public submitListing(body: SubmitListingDto) {
        return this._httpClient.post<EntityDto>("/listings/submit-listing", body);
    }

    public activateListing(body: ActivateListingDto): Observable<EntityDto> {
        const request = new HttpRequest("POST", "/listings/activate-listing", body, {
            context: new HttpContext().set(SKIP_ERROR_TOAST, true)
        });
        return this._httpClient.request(request).pipe(
            map((result) => plainToInstance(EntityDto, result)),
            catchError((error: HttpErrorDto) => {
                if (error.code !== INVALID_LISTING_STATUS) {
                    this._notificationsService.displayHttpError(error);
                }
                return throwError(() => error);
            })
        );
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
