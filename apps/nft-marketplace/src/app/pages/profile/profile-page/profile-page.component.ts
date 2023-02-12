import { Component, OnInit } from "@angular/core";
import { UserNftsStore } from "../../../@core/store/user-nfts-store";

@Component({
    selector: "nft-marketplace-profile-page",
    templateUrl: "./profile-page.component.html",
    styleUrls: ["./profile-page.component.scss"]
})
export class ProfilePageComponent implements OnInit {
    constructor(public userNftsStore: UserNftsStore) {}

    ngOnInit(): void {
        if (this.userNftsStore.all.length === 0) {
            this.userNftsStore.fetchNft();
        }
    }
}
