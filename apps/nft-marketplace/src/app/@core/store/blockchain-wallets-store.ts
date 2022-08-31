import { BlockchainWalletDto } from "@swan/dto";
import { action, computed, makeObservable, observable } from "mobx";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { toStream } from "mobx-utils";

@Injectable({ providedIn: "root" })
export class BlockchainWalletsStore {
    @observable
    wallets: Array<BlockchainWalletDto>;

    @observable
    wallet: BlockchainWalletDto;

    constructor() {
        this.wallets = [];
        makeObservable(this);
    }

    @action
    setWallets(wallets: Array<BlockchainWalletDto>) {
        this.wallets = [...wallets];
    }

    @action
    setWallet(wallet: BlockchainWalletDto) {
        this.wallet = wallet;
    }

    @computed
    get allWallets(): Array<BlockchainWalletDto> {
        return this.wallets;
    }

    @computed
    get theWallet(): BlockchainWalletDto {
        return this.wallet;
    }
}
