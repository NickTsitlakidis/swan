import { NgModule } from "@angular/core";
import { ProductCardModule } from "../../@theme/components/product-card/product-card.module";

import { ThemeModule } from "../../@theme/theme.module";
import { HomePageComponent } from "./home-page/home-page.component";
import { HomeRoutingModule } from "./home-routing.module";
import { HomeComponent } from "./home.component";

@NgModule({
    imports: [ThemeModule, HomeRoutingModule, ProductCardModule],
    declarations: [HomeComponent, HomePageComponent]
})
export class HomeModule {}
