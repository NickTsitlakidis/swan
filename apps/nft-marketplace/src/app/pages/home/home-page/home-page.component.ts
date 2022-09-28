import { BuyListingDto, ListingDto, PaginationDto } from "@swan/dto";
import { Component, OnInit } from "@angular/core";
import { ListingsService } from "../../../@core/services/listings/listings.service";
import { BlockchainWalletsFacade } from "../../../@core/store/blockchain-wallets-facade";
import { filter, first } from "rxjs/operators";
import { from, of, switchMap, throwError, zip } from "rxjs";
import { WalletRegistryService } from "../../../@core/services/chains/wallet-registry.service";
import { isNil } from "lodash";

@Component({
    selector: "nft-marketplace-home-page",
    templateUrl: "./home-page.component.html",
    styleUrls: ["./home-page.component.scss"]
})
export class HomePageComponent implements OnInit {
    listings: ListingDto[];
    constructor(
        private _listingService: ListingsService,
        private _blockchainWalletsFacade: BlockchainWalletsFacade,
        private _walletRegistry: WalletRegistryService
    ) {}

    ngOnInit() {
        const query = {
            skip: 0,
            limit: 50
        } as PaginationDto;
        this._listingService.getActiveListings(query).subscribe((data) => {
            this.listings = data.items;
            console.log(data);
        });
    }

    buyToken(listing: ListingDto) {
        this._blockchainWalletsFacade
            .streamBlockchains()
            .pipe(
                switchMap((chains) => from(chains)),
                filter((everyChain) => everyChain.id === listing.blockchainId),
                first(),
                switchMap((blockchain) => {
                    return zip(this._walletRegistry.getWalletService(listing.walletId), of(blockchain));
                }),
                switchMap(([walletService, blockchain]) => {
                    if (isNil(walletService)) {
                        return throwError(() => "No service found for wallet");
                    }
                    return walletService.buyToken(listing, blockchain);
                }),
                switchMap((hash) => {
                    const dto = new BuyListingDto();
                    dto.chainTransactionHash = hash;
                    dto.listingId = listing.id;
                    dto.walletId = listing.walletId;
                    return this._listingService.buyListing(dto);
                })
            )
            .subscribe((result) => {
                console.log(result);
            });
    }
}
