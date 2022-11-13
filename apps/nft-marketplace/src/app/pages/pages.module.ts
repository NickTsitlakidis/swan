import { NgModule } from "@angular/core";

import { ThemeModule } from "../@theme/theme.module";
import { PagesComponent } from "./pages.component";
import { HdWalletAdapterModule } from "@heavy-duty/wallet-adapter";
import { PagesRoutingModule } from "./pages-routing.module";
import { MiscellaneousModule } from "./miscellaneous/miscellaneous.module";
import { HomeModule } from "./home/home.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CreateCollectionModule } from "./create-collection/create-collection.module";
import { CreateNFTModule } from "./create-nft/create-nft.module";
@NgModule({
    imports: [
        PagesRoutingModule,
        ReactiveFormsModule,
        FormsModule,
        ThemeModule,
        MiscellaneousModule,
        HomeModule,
        CreateCollectionModule,
        CreateNFTModule,
        HdWalletAdapterModule.forRoot({ autoConnect: true })
    ],
    declarations: [PagesComponent]
})
export class PagesModule {}
