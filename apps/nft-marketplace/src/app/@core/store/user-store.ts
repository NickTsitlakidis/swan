import { Injectable } from "@angular/core";
import { action, computed, makeObservable, observable } from "mobx";
import { TokenDto, UserDto } from "@swan/dto";
import { isNil } from "lodash";
import { ComplexState } from "./complex-state";

@Injectable({ providedIn: "root" })
export class UserStore {
    @observable
    token: ComplexState<TokenDto>;

    @observable
    user: ComplexState<UserDto>;

    constructor() {
        this.token = new ComplexState<TokenDto>();
        this.user = new ComplexState<UserDto>();
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

    @computed
    get isLoggedIn(): boolean {
        return !isNil(this.token);
    }

    @computed
    get isLoading(): boolean {
        return this.user.isLoading || this.token.isLoading;
    }
}
