import { BuyListingDto, ListingDto, PaginationDto } from "@swan/dto";
import { Component, OnInit } from "@angular/core";
import { ListingsService } from "../../../@core/services/listings/listings.service";
import { switchMap, throwError } from "rxjs";
import { WalletRegistryService } from "../../../@core/services/chains/wallet-registry.service";
import { isNil } from "lodash";
import { BlockchainWalletsStore } from "../../../@core/store/blockchain-wallets-store";

@Component({
    selector: "nft-marketplace-home-page",
    templateUrl: "./home-page.component.html",
    styleUrls: ["./home-page.component.scss"]
})
export class HomePageComponent implements OnInit {
    listings: ListingDto[];
    constructor(
        private _listingService: ListingsService,
        private _blockchainWalletsStore: BlockchainWalletsStore,
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
        const listingChain = this._blockchainWalletsStore.blockchains.find(
            (everyChain) => everyChain.id === listing.blockchainId
        );
        if (listingChain) {
            this._walletRegistry
                .getWalletService(listing.walletId)
                .pipe(
                    switchMap((walletService) => {
                        if (isNil(walletService)) {
                            return throwError(() => "No service found for wallet");
                        }
                        return walletService.buyToken(listing, listingChain);
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
        } else {
            //todo: should only happen if the listing chain is disabled in swan, display error
        }
    }
}
