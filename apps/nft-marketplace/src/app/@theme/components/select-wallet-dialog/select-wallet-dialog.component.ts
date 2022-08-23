import { ChangeDetectionStrategy, Component, Inject, ViewEncapsulation } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
    selector: "nft-marketplace-select-wallet-dialog",
    templateUrl: "./select-wallet-dialog.component.html",
    styleUrls: ["./select-wallet-dialog.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class SelectWalletDialogComponent {
    public wallets: { img: string; title: string; chain: string }[];

    constructor(
        public dialogRef: MatDialogRef<SelectWalletDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { wallets: { img: string; title: string; chain: string }[] }
    ) {
        this.wallets = data.wallets;
    }

    close(walletName: string) {
        this.dialogRef.close(walletName);
    }
}
