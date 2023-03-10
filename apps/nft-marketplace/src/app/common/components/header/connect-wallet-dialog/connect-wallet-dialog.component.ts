import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { makeObservable } from "mobx";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { BlockchainWalletsStore } from "../../../store/blockchain-wallets-store";
import { action, computed, observable } from "mobx-angular";
import { WalletDto } from "@swan/dto";
import { MenuItem } from "primeng/api";
import { isNil } from "@nft-marketplace/utils";

@Component({
    selector: "swan-wallet-selection-dialog",
    styleUrls: ["./connect-wallet-dialog.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: "./connect-wallet-dialog.component.html"
})
export class ConnectWalletDialogComponent implements OnInit {
    @observable
    selectedChainId: string;

    constructor(
        private _dialogRef: DynamicDialogRef,
        private _blockchainWalletsStore: BlockchainWalletsStore,
        private _config: DynamicDialogConfig
    ) {
        makeObservable(this);
    }

    ngOnInit(): void {
        if (this._blockchainWalletsStore.walletsState.hasState) {
            this.updateSelectedChain(this._blockchainWalletsStore.blockchainWallets[0].blockchain.id);
        }
    }

    @computed
    get wallets(): Array<WalletDto> {
        const found = this._blockchainWalletsStore.blockchainWallets.find(
            (blockchainWallets) => blockchainWallets.blockchain.id === this.selectedChainId
        );

        return isNil(found) ? [] : found.wallets;
    }

    @computed
    get tabItems(): Array<MenuItem> {
        return this._blockchainWalletsStore.blockchainWallets.map((blockchainWallets) => {
            return {
                label: blockchainWallets.blockchain.name,
                id: blockchainWallets.blockchain.id,
                icon: `pi ${blockchainWallets.group}-icon`,
                command: (event) => this.updateSelectedChain(event.item.id)
            };
        });
    }

    @action
    updateSelectedChain(blockchainId: string) {
        this.selectedChainId = blockchainId;
    }

    onWalletSelect(wallet: WalletDto) {
        this._dialogRef.close(wallet);
    }
}
