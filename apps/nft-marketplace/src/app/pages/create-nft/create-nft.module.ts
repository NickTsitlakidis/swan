import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { NbButtonModule, NbFormFieldModule, NbInputModule, NbToggleModule } from "@nebular/theme";
import { TitleSubTitleModule } from "../../@theme/components/title-subtitle/title-subtitle.module";
import { UploadModule } from "../../@theme/components/upload/upload.module";

import { ThemeModule } from "../../@theme/theme.module";
import { CreateNFTPageComponent } from "./create-nft-page/create-nft-page.component";
import { CreateNFTRoutingModule } from "./create-nft-routing.module";
import { CreateNFTComponent } from "./create-nft.component";
import { ChainsModule } from "../../@core/services/chains/chains.module";

@NgModule({
    imports: [
        ThemeModule,
        CreateNFTRoutingModule,
        ReactiveFormsModule,
        NbInputModule,
        NbButtonModule,
        NbToggleModule,
        UploadModule,
        NbFormFieldModule,
        TitleSubTitleModule,
        ChainsModule
    ],
    declarations: [CreateNFTComponent, CreateNFTPageComponent],
    providers: []
})
export class CreateNFTModule {}
