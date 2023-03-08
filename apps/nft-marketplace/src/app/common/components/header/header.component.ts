import { ChangeDetectionStrategy, Component, OnDestroy } from "@angular/core";
import { WalletDto } from "@swan/dto";

import { of, switchMap, zip } from "rxjs";
import { makeObservable } from "mobx";
import { computed } from "mobx-angular";
import { isNil } from "@nft-marketplace/utils";
import { UserStore } from "../../store/user-store";
import { WalletRegistryService } from "../../services/chains/wallet-registry.service";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import { ConnectWalletDialogComponent } from "./connect-wallet-dialog/connect-wallet-dialog.component";
import { filter } from "rxjs/operators";

@Component({
    selector: "swan-header",
    styleUrls: ["./header.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: "./header.component.html"
})
export class HeaderComponent implements OnDestroy {
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

    private _dialogReference: DynamicDialogRef;

    constructor(
        private _dialogService: DialogService,
        private _userStore: UserStore,
        private _walletRegistryService: WalletRegistryService
    ) {
        makeObservable(this);
    }

    ngOnDestroy(): void {
        if (!isNil(this._dialogReference)) {
            this._dialogReference.close();
        }
    }

    @computed
    get isLoggedIn(): boolean {
        return !isNil(this._userStore.user);
    }

    onConnectWallet() {
        this._dialogReference = this._dialogService.open(ConnectWalletDialogComponent, {
            header: "Select a wallet",
            maximizable: false
        });

        this._dialogReference.onClose
            .pipe(
                filter((selected: WalletDto) => !isNil(selected)),
                switchMap((selected: WalletDto) => {
                    return zip(of(selected), this._walletRegistryService.getWalletService(selected.id));
                }),
                switchMap(([selected, service]) => {
                    return zip(of(selected), of(service), service.getPublicKey());
                })
            )
            .subscribe(([selected, service, address]) => {
                this._userStore.authenticateWithSignature(selected, address, service);
            });
    }
}
