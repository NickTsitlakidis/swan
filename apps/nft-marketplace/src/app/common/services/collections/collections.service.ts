import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AvailabilityDto, CollectionDto, CreateCollectionDto, EntityDto } from "@swan/dto";
import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";
import { plainToInstance } from "class-transformer";
import { random } from "radash";

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
        const dto1 = new CollectionDto();
        dto1.id = random(1, 100).toString();
        dto1.name = "Collection 1";
        dto1.bannerImageUrl = "https://i.seadn.io/gcs/files/8e85f3c4fe4ca9d706b7e5d9c8c7f60b.jpg?auto=format&w=1920";
        dto1.logoImageUrl = "https://i.seadn.io/gcs/files/085f1f87a16cec774c208a6083954bd7.png?auto=format&w=256";
        dto1.totalItems = 4555;
        dto1.volume = 36465323.234;
        dto1.paymentTokenSymbol = "BNB";

        const dto2 = new CollectionDto();
        dto2.name = "Collection 2";
        dto2.totalItems = 10100;
        dto2.id = random(1, 100).toString();
        dto2.volume = 56698.234;
        dto2.paymentTokenSymbol = "AVAX";
        dto2.bannerImageUrl =
            "https://i.seadn.io/gae/KIC472DrvRwqfPXHohr7W9Y5WHhDLf-3NzgoGjNocMppbVit3cqP5wc_gXB_7YKUZ50xWDt3hsg-Q7DunC3SXKFk5U328KEo_Rd0EA?auto=format&w=1920";
        dto2.logoImageUrl =
            "https://i.seadn.io/gae/dZlvwbSUhpOKnimbvkulcR_eCJNEi3A1XOFkzhoEN4YE_dinmQmUkOfGhc-XLyuNlB6EwotA9UI4qtnzfoVjSPBoI1FPALjcEStabIc?auto=format&w=256";
        return of([dto1, dto2, dto1, dto2]);
    }
}
