import { Injectable } from "@angular/core";
import { action, makeObservable, observable } from "mobx";
import { EvmContractDto } from "@swan/dto";

@Injectable({ providedIn: "root" })
export class EvmContractsStore {
    @observable
    erc721Contracts: Array<EvmContractDto>;

    @observable
    marketplaceContracts: Array<EvmContractDto>;

    constructor() {
        makeObservable(this);
        this.marketplaceContracts = [];
        this.erc721Contracts = [];
    }

    @action
    setMarketplaceContracts(contracts: Array<EvmContractDto>) {
        this.marketplaceContracts = contracts.slice(0);
    }

    @action
    setErc721Contracts(contracts: Array<EvmContractDto>) {
        this.erc721Contracts = contracts.slice(0);
    }
}
