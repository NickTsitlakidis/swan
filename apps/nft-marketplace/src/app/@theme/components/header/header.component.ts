import { BlockchainDto } from "./../../../../../../../libs/dto/src/lib/blockchain-dto";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from "@angular/core";
import {
    BlockchainWalletDto,
    StartSignatureAuthenticationDto,
    SupportedWallets,
    UserWalletDto,
    WalletDto
} from "@swan/dto";

import { Router } from "@angular/router";
import { WalletRegistryService } from "../../../@core/services/chains/wallet-registry.service";
import { firstValueFrom, of } from "rxjs";
import { BlockchainWalletsFacade } from "../../../@core/store/blockchain-wallets-facade";
import { UserFacade } from "../../../@core/store/user-facade";
import { Janitor } from "../../../@core/components/janitor";

@Component({
    selector: "nft-marketplace-header",
    styleUrls: ["./header.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: "./header.component.html"
})
export class HeaderComponent extends Janitor implements OnInit {
    public walletName: SupportedWallets;
    public selectedWallets: WalletDto[] | undefined;
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
        private _router: Router,
        private _cd: ChangeDetectorRef,
        private _walletRegistryService: WalletRegistryService,
        private _userFacade: UserFacade
    ) {
        super();
        this.userWallets = [];
    }

    ngOnInit() {
        const blockchainsSub = this._blockchainWalletsFacade.streamWallets().subscribe((blockchainWallets) => {
            this.chainsNew = blockchainWallets;

            const userSub = this._userFacade.streamUser().subscribe((user) => {
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
            this.addSubscription(userSub);
        });
        this._userFacade.refreshUser();
        this.addSubscription(blockchainsSub);
    }

    public async walletSelected(event: { originalEvent: PointerEvent; value: BlockchainDto }) {
        const wallet = event.value;
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
            await this._userFacade.addUserWallet(authBody);
        } else {
            await this._userFacade.authenticateWithSignature(authBody);
        }
    }

    public navigateTo(link: string) {
        this._router.navigate([link]);
    }
}
