import { Component, OnInit } from "@angular/core";
import { SupportedWallets } from "@nft-marketplace/common";
import { WalletName } from "@solana/wallet-adapter-base";
import { BlockChains } from "../../../@core/interfaces/blockchain.interface";
import { BlockChainService } from "../../../@core/services/blockchain.service";

import { ImagesService } from "../../../@core/services/images_helper/images.service";
@Component({
    selector: "nft-marketplace-header",
    styleUrls: ["./header.component.scss"],
    templateUrl: "./header.component.html"
})
export class HeaderComponent implements OnInit {
    public chains: BlockChains[] | undefined;
    public walletName: SupportedWallets;
    public selectedWallet: BlockChains;

    constructor(public imagesService: ImagesService, private _blockChainService: BlockChainService) {}

    ngOnInit() {
        this._connectToObservables();

        this.walletName = this._blockChainService.getWalletName();
    }

    public walletSelected(walletName: WalletName) {
        const chain = this._blockChainService.getWalletServiceByName(walletName, this.chains);
        chain?.chain.service.onSelectWallet(walletName);
        this._blockChainService.startChainAuth(chain?.chain.service);
    }

    /*********************************************************
     *                  Private Methods
     *********************************************************/

    private _connectToObservables() {
        this._blockChainService.getWallets().subscribe((data) => {
            this.chains = data;
        });
    }
}
