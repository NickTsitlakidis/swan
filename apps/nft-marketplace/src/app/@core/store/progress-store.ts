import { Injectable } from "@angular/core";
import { makeObservable } from "mobx";
import { BlockchainWalletsStore } from "./blockchain-wallets-store";
import { CategoriesStore } from "./categories-store";
import { ClientStore } from "./client-store";
import { EvmContractsStore } from "./evm-contracts-store";
import { UserNftsStore } from "./user-nfts-store";
import { UserStore } from "./user-store";
import { StateStore } from "./state-store";
import { computed } from "mobx-angular";

@Injectable({
    providedIn: "root"
})
export class ProgressStore {
    private _stores: Array<StateStore>;

    constructor(
        blockchainWalletsStore: BlockchainWalletsStore,
        categoriesStore: CategoriesStore,
        clientStore: ClientStore,
        evmContractsStore: EvmContractsStore,
        userNftsStore: UserNftsStore,
        userStore: UserStore
    ) {
        this._stores = [
            blockchainWalletsStore,
            categoriesStore,
            clientStore,
            evmContractsStore,
            userNftsStore,
            userStore
        ];
        makeObservable(this);
    }

    @computed
    get isInProgress(): boolean {
        return this._stores.some((store) => store.isLoading);
    }
}
