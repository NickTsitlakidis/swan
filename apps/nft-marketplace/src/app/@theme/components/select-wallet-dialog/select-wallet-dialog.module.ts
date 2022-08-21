import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { SelectWalletDialogComponent } from "./select-wallet-dialog.component";

@NgModule({
    exports: [SelectWalletDialogComponent],
    imports: [CommonModule],
    declarations: [SelectWalletDialogComponent]
})
export class SelectWalletDialogModule {}
