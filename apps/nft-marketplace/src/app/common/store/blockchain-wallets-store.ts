import { BlockchainDto, BlockchainWalletDto } from "@swan/dto";
import { action, computed, observable } from "mobx-angular";
import { Injectable } from "@angular/core";
import { unique } from "radash";
import { ComplexState } from "./complex-state";
import { SupportService } from "../services/support/support.service";
import { StateStore } from "./state-store";
import { makeObservable, runInAction } from "mobx";

@Injectable({ providedIn: "root" })
export class BlockchainWalletsStore implements StateStore {
    @observable
    walletsState: ComplexState<Array<BlockchainWalletDto>>;

    constructor(private _supportService: SupportService) {
        this.walletsState = new ComplexState<Array<BlockchainWalletDto>>();
        makeObservable(this);
        this.fetchWallets();
    }

    @computed
    get blockchains(): Array<BlockchainDto> {
        if (this.walletsState.hasState) {
            const blockchains = this.walletsState.state.map((wallet) => wallet.blockchain);
            return unique(blockchains, (chain) => chain.id);
        }

        return [];
    }

    @computed
    get wallets(): Array<BlockchainWalletDto> {
        return this.walletsState.hasState ? this.walletsState.state.slice(0) : [];
    }

    @computed
    get tokenSymbols(): Array<string> {
        if (!this.walletsState.hasState) {
            return [];
        }

        return unique(this.walletsState.state.map((dto) => dto.mainTokenSymbol));
    }

    @computed
    get isLoading(): boolean {
        return this.walletsState.isLoading;
    }

    @action
    fetchWallets() {
        this.walletsState = ComplexState.fromLoading();
        this._supportService.getBlockchainWallets().subscribe((wallets) => {
            runInAction(() => {
                this.walletsState = ComplexState.fromSuccess(wallets);
            });
        });
    }
}
