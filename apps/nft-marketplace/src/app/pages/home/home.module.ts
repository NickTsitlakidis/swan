import { NgModule } from "@angular/core";
import { ProductCardModule } from "../../common/components/product-card/product-card.module";

import { HomePageComponent } from "./home-page.component";
import { HomeRoutingModule } from "./home-routing.module";
import { CommonModule } from "@angular/common";

@NgModule({
    imports: [HomeRoutingModule, ProductCardModule, CommonModule],
    declarations: [HomePageComponent]
})
export class HomeModule {}
