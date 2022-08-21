import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { BlockchainWalletDto, StartSignatureAuthenticationDto, SupportedWallets, WalletDto } from "@swan/dto";

import { ImagesService } from "../../../@core/services/images/images.service";

import { faPaintBrush } from "@fortawesome/free-solid-svg-icons";
import { Router } from "@angular/router";
import { SupportService } from "../../../@core/services/support/support.service";
import { UserAuthService } from "../../../@core/services/authentication/user_auth.service";
import { WalletRegistryService } from "../../../@core/services/chains/wallet-registry.service";
import { LocalStorageService } from "ngx-webstorage";
@Component({
    selector: "nft-marketplace-header",
    styleUrls: ["./header.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: "./header.component.html"
})
export class HeaderComponent implements OnInit {
    public walletName: SupportedWallets;
    public selectedWallet: WalletDto | undefined;
    public faPaintBrush = faPaintBrush;
    public chainsNew: BlockchainWalletDto[];

    public menuitems = [
        {
            label: "Profile",
            link: "/profile"
        },
        {
            label: "Favorites",
            link: "/favorites",
            disabled: true
        },
        {
            label: "Watchlist",
            link: "/watchlist",
            disabled: true
        },
        {
            label: "My collections",
            link: "/collections",
            disabled: true
        },
        {
            label: "Settings",
            link: "/settings",
            disabled: true
        }
    ];

    constructor(
        public imagesService: ImagesService,
        private _router: Router,
        private _supportService: SupportService,
        private _cd: ChangeDetectorRef,
        private _userAuthService: UserAuthService,
        private _walletRegistryService: WalletRegistryService,
        private _lcStorage: LocalStorageService
    ) {}

    ngOnInit() {
        this._connectToObservables();
    }

    public walletSelected(wallet: WalletDto) {
        this._walletRegistryService.getWalletService(wallet.id).subscribe((service) => {
            service?.getPublicKey().subscribe((walletAddress) => {
                const authBody = new StartSignatureAuthenticationDto();
                authBody.address = walletAddress;
                authBody.blockchainId = wallet.chainId;
                authBody.walletId = wallet.id;
                this._userAuthService.authenticateWithSignature(authBody).subscribe(() => {
                    this._lcStorage.store("walletName", wallet.name);
                });
            });
        });
    }

    public navigateTo(link: string) {
        this._router.navigate([link]);
    }

    /*********************************************************
     *                  Private Methods
     *********************************************************/

    private _connectToObservables() {
        this._supportService.getBlockchainWallets().subscribe((wallets) => {
            this.chainsNew = wallets;
            const walletId = this._lcStorage.retrieve("walletId");
            const chainId = this._lcStorage.retrieve("chainId");
            this.selectedWallet = wallets
                .find((wallet) => wallet.blockchainId === chainId)
                ?.wallets.find((wallet) => wallet.id === walletId);
            this._cd.detectChanges();
        });
    }
}
