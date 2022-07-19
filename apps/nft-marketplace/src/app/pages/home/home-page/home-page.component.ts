import { Component, OnInit } from "@angular/core";
import { MetaplexMetadata } from "@nftstorage/metaplex-auth";
import { LocalStorageService } from "ngx-webstorage";
import { WalletRegistryService } from "../../../@core/services/chains/wallet-registry.service";

@Component({
    selector: "nft-marketplace-home-page",
    templateUrl: "./home-page.component.html",
    styleUrls: ["./home-page.component.scss"]
})
export class HomePageComponent implements OnInit {
    // TODO Remove it from here
    public userNfts: MetaplexMetadata[];
    constructor(private _lcStorage: LocalStorageService, private _walletRegistryService: WalletRegistryService) {}

    ngOnInit(): void {
        const walletId = this._lcStorage.retrieve("walletId");
        this._walletRegistryService.getWalletService(walletId).subscribe((service) => {
            service?.getUserNFTs().subscribe((nfts) => {
                console.log(nfts);
                this.userNfts = nfts;
            });
        });
    }
}
