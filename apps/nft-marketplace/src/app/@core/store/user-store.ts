import { Injectable } from "@angular/core";
import { action, computed, makeObservable, observable } from "mobx";
import { TokenDto, UserDto } from "@swan/dto";
import { LocalStorageService } from "ngx-webstorage";
import { isNil } from "lodash";

@Injectable({ providedIn: "root" })
export class UserStore {
    @observable
    token: TokenDto | undefined;

    @observable
    user: UserDto | undefined;

    @observable
    isLoading: boolean;

    @observable
    error: Error | undefined;

    constructor() {
        this.isLoading = false;
        makeObservable(this);
    }

    @action
    setToken(token: TokenDto, skipLoadingUpdate = false) {
        this.token = token;
        if (!skipLoadingUpdate) {
            this.isLoading = false;
        }
    }

    @action
    setUser(user: UserDto, skipLoadingUpdate = false) {
        this.user = user;
        if (!skipLoadingUpdate) {
            this.isLoading = false;
        }
    }

    @action
    startLoading() {
        this.isLoading = true;
    }

    @action
    finishLoading(error?: Error) {
        this.isLoading = false;
        if (error) {
            this.error = error;
        }
    }

    @computed
    get isLoggedIn(): boolean {
        return !isNil(this.token);
    }
}
