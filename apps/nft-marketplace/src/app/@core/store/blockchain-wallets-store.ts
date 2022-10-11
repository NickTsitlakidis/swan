import { BlockchainDto, BlockchainWalletDto } from "@swan/dto";
import { action, computed, makeObservable, observable } from "mobx";
import { Injectable } from "@angular/core";
import { unique } from "radash";

@Injectable({ providedIn: "root" })
export class BlockchainWalletsStore {
    @observable
    wallets: Array<BlockchainWalletDto>;

    constructor() {
        this.wallets = [];
        makeObservable(this);
    }

    @computed
    get blockchains(): Array<BlockchainDto> {
        const blockchains = this.wallets.map((wallet) => wallet.blockchain);
        return unique(blockchains, (chain) => chain.id);
    }

    @action
    setWallets(wallets: Array<BlockchainWalletDto>) {
        this.wallets = [...wallets];
    }
}
