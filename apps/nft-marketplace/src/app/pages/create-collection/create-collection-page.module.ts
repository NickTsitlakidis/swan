import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { ImagePlaceholderModule } from "../../common/components/image-placeholder/image-placeholder.module";
import { TitleSubTitleModule } from "../../common/components/title-subtitle/title-subtitle.module";

import { CreateCollectionPageComponent } from "./create-collection-page.component";
import { CreateCollectionRoutingModule } from "./create-collection-routing.module";

import { ValidateName, ValidateUrl } from "./create-collection-page.validator";
import { DropdownModule } from "primeng/dropdown";
import { InputSwitchModule } from "primeng/inputswitch";
import { InputTextModule } from "primeng/inputtext";
import { InputTextareaModule } from "primeng/inputtextarea";
import { MobxAngularModule } from "mobx-angular";
import { CommonModule } from "@angular/common";

@NgModule({
    imports: [
        CommonModule,
        CreateCollectionRoutingModule,
        ReactiveFormsModule,
        TitleSubTitleModule,
        ImagePlaceholderModule,
        DropdownModule,
        InputSwitchModule,
        InputTextModule,
        InputTextareaModule,
        MobxAngularModule
    ],
    declarations: [CreateCollectionPageComponent],
    providers: [ValidateName, ValidateUrl]
})
export class CreateCollectionPageModule {}
