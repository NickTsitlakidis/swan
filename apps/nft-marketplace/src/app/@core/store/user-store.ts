import { Injectable } from "@angular/core";
import { action, computed, makeObservable, observable } from "mobx";
import { ProfileNftDto, TokenDto, UserDto } from "@swan/dto";
import { isNil } from "lodash";
import { ComplexState } from "./complex-state";

@Injectable({ providedIn: "root" })
export class UserStore {
    @observable
    token: ComplexState<TokenDto>;

    @observable
    user: ComplexState<UserDto>;

    @observable
    nft: ComplexState<Array<ProfileNftDto>>;

    constructor() {
        this.token = new ComplexState<TokenDto>();
        this.user = new ComplexState<UserDto>();
        this.nft = new ComplexState<Array<ProfileNftDto>>();
        makeObservable(this);
    }

    @action
    setToken(token: ComplexState<TokenDto>) {
        this.token = token;
    }

    @action
    clearToken() {
        this.token = new ComplexState<TokenDto>();
    }

    @action
    setUser(user: ComplexState<UserDto>) {
        this.user = user;
    }

    @action
    addSwanNft(nft: ComplexState<Array<ProfileNftDto>>) {
        this.nft = nft;
    }

    @action
    addExternalNft(nft: ComplexState<Array<ProfileNftDto>>) {
        if (!nft.error) {
            if (!this.nft.error) {
                const finalArray = this.nft.state.slice(0).concat(nft.state);
                this.nft = ComplexState.fromSuccess(finalArray);
            }
        }
    }

    @computed
    get isLoggedIn(): boolean {
        return !isNil(this.token);
    }

    @computed
    get isLoading(): boolean {
        return this.user.isLoading || this.token.isLoading;
    }
}
