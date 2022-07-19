import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { ProductCardComponent } from "./product-card.component";

@NgModule({
    exports: [ProductCardComponent],
    imports: [CommonModule],
    declarations: [ProductCardComponent]
})
export class ProductCardModule {}
