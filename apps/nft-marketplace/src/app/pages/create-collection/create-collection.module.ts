import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { FaIconLibrary, FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { NbFormFieldModule, NbInputModule, NbSelectModule, NbToggleModule } from "@nebular/theme";
import { ImagePlaceholderModule } from "../../@theme/components/image-placeholder/image-placeholder.module";
import { TitleSubTitleModule } from "../../@theme/components/title-subtitle/title-subtitle.module";

import { ThemeModule } from "../../@theme/theme.module";
import { CreateCollectionPageComponent } from "./create-collection-page/create-collection-page.component";
import { CreateCollectionRoutingModule } from "./create-collection-routing.module";
import { CreateCollectionComponent } from "./create-collection.component";

import { faInstagram, faMedium, faDiscord, faTelegram } from "@fortawesome/free-brands-svg-icons";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";

@NgModule({
    imports: [
        ThemeModule,
        CreateCollectionRoutingModule,
        NbInputModule,
        NbSelectModule,
        NbFormFieldModule,
        FontAwesomeModule,
        ReactiveFormsModule,
        NbToggleModule,
        TitleSubTitleModule,
        ImagePlaceholderModule
    ],
    declarations: [CreateCollectionComponent, CreateCollectionPageComponent]
})
export class CreateCollectionModule {
    constructor(library: FaIconLibrary) {
        library.addIcons(faInstagram, faMedium, faDiscord, faTelegram, faGlobe);
    }
}