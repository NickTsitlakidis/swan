import { DropdownModule } from "primeng/dropdown";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { TitleSubTitleModule } from "../../@theme/components/title-subtitle/title-subtitle.module";
import { UploadModule } from "../../@theme/components/upload/upload.module";

import { ThemeModule } from "../../@theme/theme.module";
import { CreateNFTPageComponent } from "./create-nft-page/create-nft-page.component";
import { CreateNFTRoutingModule } from "./create-nft-routing.module";
import { CreateNFTComponent } from "./create-nft.component";
import { InputSwitchModule } from "primeng/inputswitch";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { InputTextareaModule } from "primeng/inputtextarea";

@NgModule({
    imports: [
        ThemeModule,
        CreateNFTRoutingModule,
        ReactiveFormsModule,
        UploadModule,
        TitleSubTitleModule,
        DropdownModule,
        InputSwitchModule,
        ButtonModule,
        InputTextModule,
        InputTextareaModule
    ],
    declarations: [CreateNFTComponent, CreateNFTPageComponent]
})
export class CreateNFTModule {}
