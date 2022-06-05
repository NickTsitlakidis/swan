import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { SupportedWallets } from "@nft-marketplace/common";
import { WalletName } from "@solana/wallet-adapter-base";
import { BlockChains } from "../../../@core/interfaces/blockchain.interface";
import { BlockChainService } from "../../../@core/services/blockchain.service";

import { ImagesService } from "../../../@core/services/images/images.service";

import { faPaintBrush } from "@fortawesome/free-solid-svg-icons";
import { Router } from "@angular/router";
@Component({
    selector: "nft-marketplace-header",
    styleUrls: ["./header.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: "./header.component.html"
})
export class HeaderComponent implements OnInit {
    public chains: BlockChains[] | undefined = [];
    public walletName: SupportedWallets;
    public selectedWallet: BlockChains;
    public faPaintBrush = faPaintBrush;

    constructor(
        public imagesService: ImagesService,
        private _blockChainService: BlockChainService,
        private _router: Router
    ) {}

    ngOnInit() {
        this._connectToObservables();

        this.walletName = this._blockChainService.getWalletName();
    }

    public walletSelected(walletName: WalletName) {
        if (this._blockChainService.getWalletName() !== walletName) {
            this._blockChainService.setWalletName(walletName);
        }
        const chain = this._blockChainService.getWalletServiceByName(walletName, this.chains);
        this._blockChainService.setBlockchain(chain?.chain.title);
        chain?.chain.service.onSelectWallet(walletName);
        this._blockChainService.startChainAuth(chain?.chain.service);
    }

    public navigateToCreateCollection() {
        this._router.navigate(["/create-collection"]);
    }

    public navigateToCreateNFT() {
        this._router.navigate(["/create-nft"]);
    }

    /*********************************************************
     *                  Private Methods
     *********************************************************/

    private _connectToObservables() {
        const arrOfWalletObservables = this._blockChainService.getWallets();
        for (const observable of arrOfWalletObservables) {
            observable.subscribe((data) => {
                if (data) {
                    this.chains?.push(data);
                }
            });
        }
    }
}
