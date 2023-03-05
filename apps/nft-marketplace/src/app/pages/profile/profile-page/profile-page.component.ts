import { Component, OnInit } from "@angular/core";
import { UserNftsStore } from "../../../common/store/user-nfts-store";
import { makeObservable } from "mobx";
import { computed } from "mobx-angular";
import { ProfileNftDto } from "@swan/dto";

@Component({
    selector: "swan-profile-page",
    templateUrl: "./profile-page.component.html",
    styleUrls: ["./profile-page.component.scss"]
})
export class ProfilePageComponent implements OnInit {
    constructor(private _userNftsStore: UserNftsStore) {
        makeObservable(this);
    }

    ngOnInit(): void {
        if (this._userNftsStore.all.length === 0) {
            this._userNftsStore.fetchNft();
        }
    }

    @computed
    get allNfts(): Array<ProfileNftDto> {
        return this._userNftsStore.all;
    }
}
