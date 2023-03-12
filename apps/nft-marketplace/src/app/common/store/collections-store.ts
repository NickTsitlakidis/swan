import { Injectable } from "@angular/core";
import { action, computed, observable } from "mobx-angular";
import { CollectionDto } from "@swan/dto";
import { makeObservable, runInAction } from "mobx";
import { ComplexState } from "./complex-state";
import { CollectionsService } from "../services/collections/collections.service";
import { StateStore } from "./state-store";
import { PlatformUtils } from "../utils/platform-utils";
import { makeStateKey, StateKey, TransferState } from "@angular/platform-browser";

@Injectable({ providedIn: "root" })
export class CollectionsStore implements StateStore {
    @observable
    trendingCollectionsState: ComplexState<Array<CollectionDto>>;

    @observable
    categoryCollectionsState: ComplexState<Map<string, Array<CollectionDto>>>;

    private readonly _trendingStateKey: StateKey<Array<CollectionDto>>;

    constructor(
        private _collectionsService: CollectionsService,
        private _platformUtils: PlatformUtils,
        private _transferState: TransferState
    ) {
        this._trendingStateKey = makeStateKey("trending-collections");
        this.trendingCollectionsState = new ComplexState<Array<CollectionDto>>();
        this.categoryCollectionsState = new ComplexState<Map<string, Array<CollectionDto>>>();
        makeObservable(this);
    }

    @action
    fetchTrending() {
        if (this._transferState.hasKey(this._trendingStateKey)) {
            this.trendingCollectionsState = ComplexState.fromSuccess(
                this._transferState.get(this._trendingStateKey, [])
            );
            this._transferState.remove(this._trendingStateKey);
        } else {
            this.trendingCollectionsState = ComplexState.fromLoading();
            this._collectionsService.getTrendingCollections().subscribe({
                next: (collections) => {
                    runInAction(() => (this.trendingCollectionsState = ComplexState.fromSuccess(collections)));
                    this._transferState.set(this._trendingStateKey, collections);
                },
                error: (error) => {
                    runInAction(() => (this.trendingCollectionsState = ComplexState.fromError(error)));
                }
            });
        }
    }

    @computed
    get trending(): Array<CollectionDto> {
        return this.trendingCollectionsState.hasState ? this.trendingCollectionsState.state.slice(0) : [];
    }

    @computed
    get perCategory(): Map<string, Array<CollectionDto>> {
        return this.categoryCollectionsState.hasState ? this.categoryCollectionsState.state : new Map();
    }

    @computed
    get isLoading(): boolean {
        return this.trendingCollectionsState.isLoading || this.categoryCollectionsState.isLoading;
    }
}
