import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { NbButtonModule, NbInputModule, NbToggleModule } from "@nebular/theme";
import { TitleSubTitleModule } from "../../@theme/components/title-subtitle/title-subtitle.module";
import { UploadModule } from "../../@theme/components/upload/upload.module";

import { ThemeModule } from "../../@theme/theme.module";
import { CreateNFTPageComponent } from "./create-nft-page/create-nft-page.component";
import { CreateNFTRoutingModule } from "./create-nft-routing.module";
import { CreateNFTComponent } from "./create-nft.component";

@NgModule({
    imports: [
        ThemeModule,
        CreateNFTRoutingModule,
        ReactiveFormsModule,
        NbInputModule,
        NbButtonModule,
        NbToggleModule,
        UploadModule,
        TitleSubTitleModule
    ],
    declarations: [CreateNFTComponent, CreateNFTPageComponent],
    providers: []
})
export class CreateNFTModule {}
