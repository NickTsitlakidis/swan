import { Component, OnInit } from "@angular/core";
import { UserService } from "../../../@core/services/user/user.service";
import { ProfileNftDto } from "@swan/dto";

@Component({
    selector: "nft-marketplace-profile-page",
    templateUrl: "./profile-page.component.html",
    styleUrls: ["./profile-page.component.scss"]
})
export class ProfilePageComponent implements OnInit {
    public userNfts: ProfileNftDto[];
    constructor(private _userService: UserService) {}

    ngOnInit(): void {
        this._userService.getUserNfts().subscribe((nfts) => {
            this.userNfts = nfts;
        });
    }
}
