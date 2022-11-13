import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { SelectWalletDialogComponent } from "./select-wallet-dialog.component";
import { ButtonModule } from "primeng/button";

@NgModule({
    exports: [SelectWalletDialogComponent, ButtonModule],
    imports: [CommonModule],
    declarations: [SelectWalletDialogComponent]
})
export class SelectWalletDialogModule {}
