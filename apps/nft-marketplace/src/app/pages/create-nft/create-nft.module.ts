import { DropdownModule } from "primeng/dropdown";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { TitleSubTitleModule } from "../../common/components/title-subtitle/title-subtitle.module";
import { UploadModule } from "../../common/components/upload/upload.module";

import { CreateNFTPageComponent } from "./create-nft-page.component";
import { CreateNFTRoutingModule } from "./create-nft-routing.module";
import { InputSwitchModule } from "primeng/inputswitch";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { InputTextareaModule } from "primeng/inputtextarea";
import { CommonModule } from "@angular/common";

@NgModule({
    imports: [
        CommonModule,
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
    declarations: [CreateNFTPageComponent]
})
export class CreateNFTModule {}
