import { NgModule } from "@angular/core";
import { ProductCardModule } from "../../@theme/components/product-card/product-card.module";

import { ThemeModule } from "../../@theme/theme.module";
import { HomePageComponent } from "./home-page.component";
import { HomeRoutingModule } from "./home-routing.module";

@NgModule({
    imports: [ThemeModule, HomeRoutingModule, ProductCardModule],
    declarations: [HomePageComponent]
})
export class HomeModule {}
