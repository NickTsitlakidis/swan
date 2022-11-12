import { DropdownModule } from "primeng/dropdown";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS } from "@angular/material/dialog";

import { TitleSubTitleModule } from "../../@theme/components/title-subtitle/title-subtitle.module";
import { UploadModule } from "../../@theme/components/upload/upload.module";

import { ThemeModule } from "../../@theme/theme.module";
import { CreateNFTPageComponent } from "./create-nft-page/create-nft-page.component";
import { CreateNFTRoutingModule } from "./create-nft-routing.module";
import { CreateNFTComponent } from "./create-nft.component";
import { ChainsModule } from "../../@core/services/chains/chains.module";
import { SelectWalletDialogModule } from "../../@theme/components/select-wallet-dialog/select-wallet-dialog.module";
import { InputSwitchModule } from "primeng/inputswitch";
import { ButtonModule } from "primeng/button";

@NgModule({
    imports: [
        ThemeModule,
        CreateNFTRoutingModule,
        ReactiveFormsModule,
        UploadModule,
        TitleSubTitleModule,
        ChainsModule,
        MatDialogModule,
        SelectWalletDialogModule,
        DropdownModule,
        InputSwitchModule,
        ButtonModule
    ],
    declarations: [CreateNFTComponent, CreateNFTPageComponent],
    providers: [{ provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: {} }]
})
export class CreateNFTModule {}
