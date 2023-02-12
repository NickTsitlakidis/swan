import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";

import { ThemeModule } from "../../@theme/theme.module";
import { TitleSubTitleModule } from "../../@theme/components/title-subtitle/title-subtitle.module";
import { ProductCardModule } from "../../@theme/components/product-card/product-card.module";

import { CreateListingPageComponent } from "./create-listing-page/create-listing-page.component";
import { CreateListingRoutingModule } from "./create-listing-routing.module";
import { CreateListingComponent } from "./create-listing.component";
import { InputTextModule } from "primeng/inputtext";
import { MobxAngularModule } from "mobx-angular";

@NgModule({
    imports: [
        ThemeModule,
        CreateListingRoutingModule,
        ReactiveFormsModule,
        TitleSubTitleModule,
        ProductCardModule,
        InputTextModule,
        MobxAngularModule
    ],
    declarations: [CreateListingComponent, CreateListingPageComponent]
})
export class CreateListingModule {}
