import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { ProductCardComponent } from "./product-card.component";
import { ButtonModule } from "primeng/button";

@NgModule({
    exports: [ProductCardComponent, ButtonModule],
    imports: [CommonModule],
    declarations: [ProductCardComponent]
})
export class ProductCardModule {}
