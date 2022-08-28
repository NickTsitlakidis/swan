import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";

import { NbInputModule } from "@nebular/theme";

import { ThemeModule } from "../../@theme/theme.module";
import { TitleSubTitleModule } from "../../@theme/components/title-subtitle/title-subtitle.module";
import { ProductCardModule } from "../../@theme/components/product-card/product-card.module";

import { CreateListingPageComponent } from "./create-listing-page/create-listing-page.component";
import { CreateListingRoutingModule } from "./create-listing-routing.module";
import { CreateListingComponent } from "./create-listing.component";

@NgModule({
    imports: [
        ThemeModule,
        CreateListingRoutingModule,
        ReactiveFormsModule,
        NbInputModule,
        TitleSubTitleModule,
        ProductCardModule
    ],
    declarations: [CreateListingComponent, CreateListingPageComponent]
})
export class CreateListingModule {}
