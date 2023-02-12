import { Injectable } from "@angular/core";
import { StateStore } from "./state-store";
import { action, computed, makeObservable, observable, runInAction } from "mobx";
import { ComplexState } from "./complex-state";
import { TokenDto } from "@swan/dto";
import { isNil } from "lodash";
import { DateTime } from "luxon";
import { LocalStorageService } from "ngx-webstorage";
import { ClientService } from "../services/client/client-service";

@Injectable({ providedIn: "root" })
export class ClientStore implements StateStore {
    @observable
    tokenState: ComplexState<TokenDto>;

    constructor(private readonly _storageService: LocalStorageService, private readonly _clientService: ClientService) {
        this.tokenState = new ComplexState<TokenDto>();
        makeObservable(this);
        const existingToken = this.readTokenFromStorage();
        if (existingToken) {
            this.tokenState = ComplexState.fromSuccess(existingToken);
        }
    }

    @action
    fetchToken() {
        this.tokenState = ComplexState.fromLoading();
        this._clientService.login().subscribe({
            next: (token) => {
                this.saveTokenToStorage(token);
                runInAction(() => (this.tokenState = ComplexState.fromSuccess(token)));
            },
            error: (error) => runInAction(() => (this.tokenState = ComplexState.fromError(error)))
        });
    }

    @computed
    get isLoading(): boolean {
        return this.tokenState.isLoading;
    }

    @computed
    get clientToken(): TokenDto | undefined {
        return this.tokenState.state;
    }

    private saveTokenToStorage(token: TokenDto) {
        this._storageService.store("clientTokenValue", token.tokenValue);
        this._storageService.store("clientExpiresAt", token.expiresAt.toISO());
    }

    private readTokenFromStorage(): TokenDto | undefined {
        const userToken = this._storageService.retrieve("clientTokenValue");
        const expiresAt = this._storageService.retrieve("clientExpiresAt");

        if (!isNil(userToken) && !isNil(expiresAt)) {
            return new TokenDto(userToken, DateTime.fromISO(expiresAt));
        }

        return undefined;
    }
}
