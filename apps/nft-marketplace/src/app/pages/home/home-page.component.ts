import { BuyListingDto, ListingDto, PaginationDto } from "@swan/dto";
import { Component, OnInit } from "@angular/core";
import { ListingsService } from "../../@core/services/listings/listings.service";
import { switchMap, throwError } from "rxjs";
import { WalletRegistryService } from "../../@core/services/chains/wallet-registry.service";
import { isNil } from "@nft-marketplace/utils";
import { BlockchainWalletsStore } from "../../@core/store/blockchain-wallets-store";
import { GetUserWalletService } from "../../@core/services/chains/get-user-wallet.service";

@Component({
    selector: "swan-home-page",
    templateUrl: "./home-page.component.html",
    styleUrls: ["./home-page.component.scss"]
})
export class HomePageComponent implements OnInit {
    listings: ListingDto[];
    constructor(
        private _listingService: ListingsService,
        private _blockchainWalletsStore: BlockchainWalletsStore,
        private _walletRegistry: WalletRegistryService,
        private _getUserWalletService: GetUserWalletService
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

    async buyToken(listing: ListingDto) {
        const listingChain = this._blockchainWalletsStore.blockchains.find(
            (everyChain) => everyChain.id === listing.blockchainId
        );
        const walletId = await this._getUserWalletService.findAvailableWallet(listing.blockchainId);
        if (listingChain) {
            this._walletRegistry
                .getWalletService(walletId)
                .pipe(
                    switchMap((walletService) => {
                        if (isNil(walletService)) {
                            return throwError(() => "No service found for wallet");
                        }
                        return walletService.buyToken(listing, listingChain, listing.tokenContractAddress);
                    }),
                    switchMap((hash) => {
                        const dto = new BuyListingDto();
                        dto.chainTransactionHash = hash;
                        dto.listingId = listing.id;
                        dto.walletId = walletId;
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
