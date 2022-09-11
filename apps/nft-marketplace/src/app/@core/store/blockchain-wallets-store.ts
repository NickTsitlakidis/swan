import { BlockchainWalletDto } from "@swan/dto";
import { action, makeObservable, observable } from "mobx";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class BlockchainWalletsStore {
    @observable
    wallets: Array<BlockchainWalletDto>;

    constructor() {
        this.wallets = [];
        makeObservable(this);
    }

    @action
    setWallets(wallets: Array<BlockchainWalletDto>) {
        this.wallets = [...wallets];
    }
}
