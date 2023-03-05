import { Injectable } from "@angular/core";
import { ComplexState } from "./complex-state";
import { ProfileNftDto } from "@swan/dto";
import { UserService } from "../services/user/user.service";
import { StateStore } from "./state-store";
import { action, computed, observable } from "mobx-angular";
import { makeObservable, runInAction } from "mobx";

@Injectable({ providedIn: "root" })
export class UserNftsStore implements StateStore {
    @observable
    externalNftState: ComplexState<Array<ProfileNftDto>>;

    @observable
    swanNftState: ComplexState<Array<ProfileNftDto>>;

    constructor(private readonly _userService: UserService) {
        this.externalNftState = new ComplexState<Array<ProfileNftDto>>();
        this.swanNftState = new ComplexState<Array<ProfileNftDto>>();
        makeObservable(this);
    }

    @action
    fetchNft() {
        this.externalNftState = ComplexState.fromLoading();
        this.swanNftState = ComplexState.fromLoading();
        this._userService.getNfts().subscribe({
            next: (nfts) => runInAction(() => (this.swanNftState = ComplexState.fromSuccess(nfts))),
            error: (error) => runInAction(() => (this.swanNftState = ComplexState.fromError(error)))
        });

        this._userService.getExternalNfts().subscribe({
            next: (nfts) => runInAction(() => (this.externalNftState = ComplexState.fromSuccess(nfts))),
            error: (error) => runInAction(() => (this.externalNftState = ComplexState.fromError(error)))
        });
    }

    @computed
    get isLoading(): boolean {
        return this.externalNftState.isLoading || this.swanNftState.isLoading;
    }

    @computed
    get all(): Array<ProfileNftDto> {
        const external = this.externalNftState.hasState ? this.externalNftState.state.slice(0) : [];
        const swan = this.swanNftState.hasState ? this.swanNftState.state.slice(0) : [];
        return swan.concat(external);
    }
}
