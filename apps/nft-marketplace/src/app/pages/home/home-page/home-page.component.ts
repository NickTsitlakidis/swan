import { ListingDto, PaginationDto } from "@swan/dto";
import { Component, OnInit } from "@angular/core";
import { ListingsService } from "../../../@core/services/listings/listings.service";
import { MetamaskService } from "../../../@core/services/chains/metamask.service";

@Component({
    selector: "nft-marketplace-home-page",
    templateUrl: "./home-page.component.html",
    styleUrls: ["./home-page.component.scss"]
})
export class HomePageComponent implements OnInit {
    listings: ListingDto[];
    constructor(private _listingService: ListingsService, private _metamask: MetamaskService) {}

    ngOnInit() {
        const query = {
            skip: 0,
            limit: 50
        } as PaginationDto;
        this._listingService.getActiveListings(query).subscribe((data) => {
            this.listings = data.listingDtos;
            console.log(data);
        });
    }

    buyToken(listing: ListingDto) {
        this._metamask.buyToken(listing).subscribe((result) => console.log(result));
    }
}
