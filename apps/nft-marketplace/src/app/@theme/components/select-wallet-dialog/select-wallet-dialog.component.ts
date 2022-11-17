import { ChangeDetectionStrategy, Component, ViewEncapsulation } from "@angular/core";

@Component({
    selector: "nft-marketplace-select-wallet-dialog",
    templateUrl: "./select-wallet-dialog.component.html",
    styleUrls: ["./select-wallet-dialog.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class SelectWalletDialogComponent {
    public wallets: { img: string; title: string; chain: string }[];

    constructor() {
        //this.wallets = data.wallets;
    }

    close(walletName: string) {
        //this.dialogRef.close(walletName);
    }
}
