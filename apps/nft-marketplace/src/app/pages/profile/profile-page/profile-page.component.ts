import { Component, OnInit } from "@angular/core";
import { ProfileNftDto } from "@swan/dto";
import { Janitor } from "../../../@core/components/janitor";
import { UserFacade } from "../../../@core/store/user-facade";

@Component({
    selector: "nft-marketplace-profile-page",
    templateUrl: "./profile-page.component.html",
    styleUrls: ["./profile-page.component.scss"]
})
export class ProfilePageComponent extends Janitor implements OnInit {
    public userNfts: ProfileNftDto[];
    constructor(private _userFacade: UserFacade) {
        super();
    }

    ngOnInit(): void {
        const nftSub = this._userFacade.streamNft().subscribe((nfts) => {
            if (nfts.isEmpty) {
                this._userFacade.getNfts();
            } else {
                this.userNfts = nfts.state;
            }
        });
        this.addSubscription(nftSub);
    }
}
