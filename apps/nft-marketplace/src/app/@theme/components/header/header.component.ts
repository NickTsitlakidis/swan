import { UserService } from "../../../@core/services/user/user.service";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from "@angular/core";
import {
    BlockchainWalletDto,
    StartSignatureAuthenticationDto,
    SupportedWallets,
    UserWalletDto,
    WalletDto
} from "@swan/dto";

import { ImagesService } from "../../../@core/services/images/images.service";

import { faPaintBrush } from "@fortawesome/free-solid-svg-icons";
import { Router } from "@angular/router";
import { SupportService } from "../../../@core/services/support/support.service";
import { UserAuthService } from "../../../@core/services/authentication/user_auth.service";
import { WalletRegistryService } from "../../../@core/services/chains/wallet-registry.service";
import { firstValueFrom, of } from "rxjs";
import { BlockchainWalletsFacade } from "../../../@core/store/blockchain-wallets-facade";
import { UserFacade } from "../../../@core/store/user-facade";
@Component({
    selector: "nft-marketplace-header",
    styleUrls: ["./header.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: "./header.component.html"
})
export class HeaderComponent implements OnInit {
    public walletName: SupportedWallets;
    public selectedWallets: WalletDto[] | undefined;
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
    public isSelected: { [name: string]: { [name: string]: boolean } } = {};
    public userWallets: UserWalletDto[];

    constructor(
        private _blockchainWalletsFacade: BlockchainWalletsFacade,
        public imagesService: ImagesService,
        private _router: Router,
        private _supportService: SupportService,
        private _cd: ChangeDetectorRef,
        private _userAuthService: UserAuthService,
        private _walletRegistryService: WalletRegistryService,
        private _userService: UserService,
        private _userFacade: UserFacade
    ) {
        this.userWallets = [];
    }

    ngOnInit() {
        this._blockchainWalletsFacade.streamWallets().subscribe((blockchainWallets) => {
            this.chainsNew = blockchainWallets;

            this._userFacade.streamUser().subscribe((user) => {
                if (user) {
                    this.userWallets = user.wallets;
                    this.selectedWallets = this.chainsNew
                        .flatMap((w) => w.wallets)
                        .filter((wallet) =>
                            this.userWallets.find(
                                (w) => w.wallet.chainId === wallet.chainId && w.wallet.id === wallet.id
                            )
                        );
                    this.selectedWallets.forEach((wal) => {
                        if (!this.isSelected[wal.chainId]) {
                            this.isSelected[wal.chainId] = {};
                        }
                        this.isSelected[wal.chainId][wal.name] = true;
                    });
                }
                this._cd.detectChanges();
            });
        });
        this._userFacade.refreshUser();
    }

    public async walletSelected(wallets: WalletDto[]) {
        const wallet = wallets.pop();
        if (!wallet) {
            // TODO handle it
            return;
        }
        const service = await firstValueFrom(this._walletRegistryService.getWalletService(wallet.id));
        const walletAddress = await firstValueFrom(service?.getPublicKey() || of());
        const authBody = new StartSignatureAuthenticationDto();
        authBody.address = walletAddress;
        authBody.blockchainId = wallet.chainId;
        authBody.walletId = wallet.id;
        if (this.userWallets?.length) {
            this._userAuthService.addUserWallet(authBody).subscribe();
        } else {
            await this._userFacade.authenticateWithSignature(authBody);
        }
    }

    public navigateTo(link: string) {
        this._router.navigate([link]);
    }
}
