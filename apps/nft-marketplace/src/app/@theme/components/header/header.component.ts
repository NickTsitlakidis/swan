import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { BlockchainDto, BlockchainWalletDto, StartSignatureAuthenticationDto } from "@swan/dto";

import { Router } from "@angular/router";
import { WalletRegistryService } from "../../../@core/services/chains/wallet-registry.service";
import { firstValueFrom, of } from "rxjs";
import { BlockchainWalletsStore } from "../../../@core/store/blockchain-wallets-store";
import { UserStore } from "../../../@core/store/user-store";
import { isNil } from "lodash";
import { makeObservable, when } from "mobx";
import { computed } from "mobx-angular";
import { ProgressStore } from "../../../@core/store/progress-store";

@Component({
    selector: "nft-marketplace-header",
    styleUrls: ["./header.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: "./header.component.html"
})
export class HeaderComponent implements OnInit {
    public selectedWallets: BlockchainDto[] | undefined;

    public menuitems = [
        {
            label: "Profile",
            routerLink: "/profile"
        },
        {
            label: "Favorites",
            routerLink: "/favorites",
            disabled: true
        },
        {
            label: "Watchlist",
            routerLink: "/watchlist",
            disabled: true
        },
        {
            label: "My collections",
            routerLink: "/collections",
            disabled: true
        },
        {
            label: "Settings",
            routerLink: "/settings",
            disabled: true
        }
    ];
    public isSelected: { [name: string]: { [name: string]: boolean } } = {};
    public selectedWallet: BlockchainDto | undefined;

    constructor(
        private _blockchainWalletsStore: BlockchainWalletsStore,
        private _progressStore: ProgressStore,
        private _userStore: UserStore,
        private _router: Router,
        private _cd: ChangeDetectorRef,
        private _walletRegistryService: WalletRegistryService
    ) {
        makeObservable(this);
    }

    ngOnInit() {
        when(() => !this._userStore.userState.isLoading).then(() => {
            const storedUser = this._userStore.user;
            if (!isNil(storedUser)) {
                this.selectedWallets = this._blockchainWalletsStore.wallets
                    .flatMap((w) => w.wallets)
                    .filter((wallet) =>
                        storedUser.wallets.find((w) => w.wallet.chainId === wallet.chainId && w.wallet.id === wallet.id)
                    );
                this.selectedWallets.forEach((wal) => {
                    if (!this.isSelected[wal.chainId]) {
                        this.isSelected[wal.chainId] = {};
                    }
                    this.isSelected[wal.chainId][wal.name] = true;
                });
                // TODO previously used wallet functionality?
                this.selectedWallet = this.selectedWallets[0];
            }
            this._cd.detectChanges();
        });
        this._cd.detectChanges();
    }

    @computed
    get wallets(): Array<BlockchainWalletDto> {
        return this._blockchainWalletsStore.wallets;
    }

    @computed
    get isInProgress(): boolean {
        return this._progressStore.isInProgress;
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
        this._userStore.authenticateWithSignature(authBody, service);
    }

    public navigateTo(link: string) {
        this._router.navigate([link]);
    }
}
