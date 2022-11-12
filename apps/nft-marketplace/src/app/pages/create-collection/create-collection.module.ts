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

@NgModule({
    imports: [
        ThemeModule,
        CreateCollectionRoutingModule,
        ReactiveFormsModule,
        TitleSubTitleModule,
        ImagePlaceholderModule,
        CollectionsModule,
        DropdownModule,
        InputSwitchModule
    ],
    declarations: [CreateCollectionComponent, CreateCollectionPageComponent],
    providers: [ValidateName, ValidateUrl]
})
export class CreateCollectionModule {}
