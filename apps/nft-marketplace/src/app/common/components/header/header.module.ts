import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ConnectWalletDialogComponent } from "./connect-wallet-dialog/connect-wallet-dialog.component";
import { HeaderComponent } from "./header.component";
import { DialogService, DynamicDialogModule } from "primeng/dynamicdialog";
import { MobxAngularModule } from "mobx-angular";
import { SwanCommonModule } from "../../swan-common.module";
import { ButtonModule } from "primeng/button";
import { RouterLink } from "@angular/router";
import { TabMenuModule } from "primeng/tabmenu";
import { RippleModule } from "primeng/ripple";
import { MenuModule } from "primeng/menu";

@NgModule({
    providers: [DialogService],
    declarations: [HeaderComponent, ConnectWalletDialogComponent],
    imports: [
        CommonModule,
        DynamicDialogModule,
        MobxAngularModule,
        SwanCommonModule,
        ButtonModule,
        RouterLink,
        TabMenuModule,
        RippleModule,
        MenuModule
    ],
    exports: [HeaderComponent]
})
export class HeaderModule {}
