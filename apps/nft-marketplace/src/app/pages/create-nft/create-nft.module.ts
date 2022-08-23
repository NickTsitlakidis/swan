import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS } from "@angular/material/dialog";

import {
    NbButtonModule,
    NbFormFieldModule,
    NbInputModule,
    NbOptionModule,
    NbSelectModule,
    NbToggleModule
} from "@nebular/theme";
import { TitleSubTitleModule } from "../../@theme/components/title-subtitle/title-subtitle.module";
import { UploadModule } from "../../@theme/components/upload/upload.module";

import { ThemeModule } from "../../@theme/theme.module";
import { CreateNFTPageComponent } from "./create-nft-page/create-nft-page.component";
import { CreateNFTRoutingModule } from "./create-nft-routing.module";
import { CreateNFTComponent } from "./create-nft.component";
import { ChainsModule } from "../../@core/services/chains/chains.module";
import { SelectWalletDialogModule } from "../../@theme/components/select-wallet-dialog/select-wallet-dialog.module";

@NgModule({
    imports: [
        ThemeModule,
        CreateNFTRoutingModule,
        ReactiveFormsModule,
        NbInputModule,
        NbButtonModule,
        NbToggleModule,
        NbOptionModule,
        UploadModule,
        NbFormFieldModule,
        NbSelectModule,
        TitleSubTitleModule,
        ChainsModule,
        MatDialogModule,
        SelectWalletDialogModule
    ],
    declarations: [CreateNFTComponent, CreateNFTPageComponent],
    providers: [{ provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: {} }]
})
export class CreateNFTModule {}
