import { NgModule } from "@angular/core";
import { NbMenuModule } from "@nebular/theme";

import { ThemeModule } from "../@theme/theme.module";
import { PagesComponent } from "./pages.component";
import { HdWalletAdapterModule } from "@heavy-duty/wallet-adapter";
import { PagesRoutingModule } from "./pages-routing.module";
import { MiscellaneousModule } from "./miscellaneous/miscellaneous.module";
import { HomeModule } from "./home/home.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
@NgModule({
    imports: [
        PagesRoutingModule,
        ReactiveFormsModule,
        FormsModule,
        ThemeModule,
        NbMenuModule,
        MiscellaneousModule,
        HomeModule,
        HdWalletAdapterModule.forRoot({ autoConnect: true })
    ],
    declarations: [PagesComponent]
})
export class PagesModule {}