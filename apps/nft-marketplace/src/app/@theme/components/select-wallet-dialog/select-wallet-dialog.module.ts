import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { SelectWalletDialogComponent } from "./select-wallet-dialog.component";
import { ButtonModule } from "primeng/button";
import { DynamicDialogModule } from "primeng/dynamicdialog";

@NgModule({
    exports: [SelectWalletDialogComponent, ButtonModule],
    imports: [CommonModule, DynamicDialogModule],
    declarations: [SelectWalletDialogComponent]
})
export class SelectWalletDialogModule {}
