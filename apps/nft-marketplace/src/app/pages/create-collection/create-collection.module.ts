import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { ImagePlaceholderModule } from "../../@theme/components/image-placeholder/image-placeholder.module";
import { TitleSubTitleModule } from "../../@theme/components/title-subtitle/title-subtitle.module";

import { ThemeModule } from "../../@theme/theme.module";
import { CreateCollectionPageComponent } from "./create-collection-page/create-collection-page.component";
import { CreateCollectionRoutingModule } from "./create-collection-routing.module";
import { CreateCollectionComponent } from "./create-collection.component";

import { ValidateName, ValidateUrl } from "./create-collection-page/create-collection-page.validator";
import { CollectionsModule } from "../../@core/services/collections/collections.module";
import { DropdownModule } from "primeng/dropdown";
import { InputSwitchModule } from "primeng/inputswitch";
import { InputTextModule } from "primeng/inputtext";
import { InputTextareaModule } from "primeng/inputtextarea";
import { MobxAngularModule } from "mobx-angular";

@NgModule({
    imports: [
        ThemeModule,
        CreateCollectionRoutingModule,
        ReactiveFormsModule,
        TitleSubTitleModule,
        ImagePlaceholderModule,
        CollectionsModule,
        DropdownModule,
        InputSwitchModule,
        InputTextModule,
        InputTextareaModule,
        MobxAngularModule
    ],
    declarations: [CreateCollectionComponent, CreateCollectionPageComponent],
    providers: [ValidateName, ValidateUrl]
})
export class CreateCollectionModule {}
