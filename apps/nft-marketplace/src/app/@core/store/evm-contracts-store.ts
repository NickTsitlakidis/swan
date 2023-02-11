import { Injectable } from "@angular/core";
import { action, computed, makeObservable, observable, runInAction } from "mobx";
import { EvmContractDto } from "@swan/dto";
import { SupportService } from "../services/support/support.service";
import { ComplexState } from "./complex-state";

@Injectable({ providedIn: "root" })
export class EvmContractsStore {
    @observable
    erc721ContractsState: ComplexState<Array<EvmContractDto>>;

    @observable
    marketplaceContractsState: ComplexState<Array<EvmContractDto>>;

    constructor(private readonly _supportService: SupportService) {
        this.erc721ContractsState = new ComplexState();
        this.marketplaceContractsState = new ComplexState();
        makeObservable(this);
        this.fetchERC721Contracts();
        this.fetchMarketplaceContracts();
    }

    @computed
    get marketplaceContracts(): Array<EvmContractDto> {
        return this.marketplaceContractsState.hasState ? this.marketplaceContractsState.state.slice(0) : [];
    }

    @computed
    get erc721Contracts(): Array<EvmContractDto> {
        return this.erc721ContractsState.hasState ? this.erc721ContractsState.state.slice(0) : [];
    }

    @computed
    get isLoading(): boolean {
        return this.marketplaceContractsState.isLoading || this.erc721ContractsState.isLoading;
    }

    @action
    fetchMarketplaceContracts() {
        this.marketplaceContractsState = ComplexState.fromLoading();
        this._supportService.getEvmMarketplaceContracts().subscribe((contracts) => {
            runInAction(() => {
                this.marketplaceContractsState = ComplexState.fromSuccess(contracts.slice(0));
            });
        });
    }

    @action
    fetchERC721Contracts() {
        this.erc721ContractsState = ComplexState.fromLoading();
        this._supportService.getEvmErc721Contracts().subscribe((contracts) => {
            runInAction(() => {
                this.erc721ContractsState = ComplexState.fromSuccess(contracts.slice(0));
            });
        });
    }
}
