import { PaginationDto } from "@swan/dto";
import { Component, OnInit } from "@angular/core";
import { ListingsService } from "../../../@core/services/listings/listings.service";

@Component({
    selector: "nft-marketplace-home-page",
    templateUrl: "./home-page.component.html",
    styleUrls: ["./home-page.component.scss"]
})
export class HomePageComponent implements OnInit {
    constructor(private _listingService: ListingsService) {}

    ngOnInit() {
        const query = {
            skip: 0,
            limit: 50
        } as PaginationDto;
        this._listingService.getActiveListings(query).subscribe((data) => {
            const { listingDtos, listingsCount } = data;
            console.log(listingDtos, listingsCount);
        });
    }
}
