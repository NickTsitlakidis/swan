import { ChangeDetectionStrategy, Component, ViewEncapsulation } from "@angular/core";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";

@Component({
    selector: "swan-select-wallet-dialog",
    templateUrl: "./select-wallet-dialog.component.html",
    styleUrls: ["./select-wallet-dialog.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class SelectWalletDialogComponent {
    public wallets: { img: string; title: string; chain: string }[];

    constructor(public ref: DynamicDialogRef, public config: DynamicDialogConfig) {
        this.wallets = this.config.data.wallets;
    }

    close(walletName: string) {
        this.ref.close(walletName);
    }
}
