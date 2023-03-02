import { Injectable } from "@angular/core";
import { StateStore } from "./state-store";
import { ComplexState } from "./complex-state";
import { TokenDto } from "@swan/dto";
import { ClientService } from "../services/client/client-service";
import { action, computed, observable } from "mobx-angular";
import { makeObservable, runInAction } from "mobx";

@Injectable({ providedIn: "root" })
export class ClientStore implements StateStore {
    @observable
    tokenState: ComplexState<TokenDto>;

    constructor(private readonly _clientService: ClientService) {
        this.tokenState = new ComplexState<TokenDto>();
        makeObservable(this);
    }

    @action
    fetchToken() {
        this.tokenState = ComplexState.fromLoading();
        this._clientService.login().subscribe({
            next: (token) => {
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
}
