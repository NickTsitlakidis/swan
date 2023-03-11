import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { CollectionsStore } from "../../common/store/collections-store";
import { makeObservable } from "mobx";
import { computed } from "mobx-angular";
import { CollectionDto } from "@swan/dto";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: "swan-explore-collections-page",
    templateUrl: "./explore-collections-page.component.html",
    styleUrls: ["./explore-collections-page.component.scss"]
})
export class ExploreCollectionsPageComponent implements OnInit {
    constructor(private _collectionsStore: CollectionsStore) {
        makeObservable(this);
    }

    ngOnInit(): void {
        this._collectionsStore.fetchTrending();
    }

    @computed
    get displayedCollections(): Array<CollectionDto> {
        return this._collectionsStore.trending;
    }

    onItemSelection(collection: CollectionDto) {
        console.log(collection);
    }
}
