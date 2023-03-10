import { NgModule } from "@angular/core";
import { ProductCardModule } from "../../common/components/product-card/product-card.module";

import { ProfilePageComponent } from "./profile-page/profile-page.component";
import { ProfileRoutingModule } from "./profile-routing.module";
import { ProfileComponent } from "./profile.component";
import { MobxAngularModule } from "mobx-angular";
import { CommonModule } from "@angular/common";

@NgModule({
    imports: [CommonModule, ProfileRoutingModule, ProductCardModule, MobxAngularModule],
    declarations: [ProfileComponent, ProfilePageComponent]
})
export class ProfileModule {}
