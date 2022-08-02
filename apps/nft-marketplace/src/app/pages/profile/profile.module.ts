import { NgModule } from "@angular/core";
import { ProductCardModule } from "../../@theme/components/product-card/product-card.module";

import { ThemeModule } from "../../@theme/theme.module";
import { ProfilePageComponent } from "./profile-page/profile-page.component";
import { ProfileRoutingModule } from "./profile-routing.module";
import { ProfileComponent } from "./profile.component";

@NgModule({
    imports: [ThemeModule, ProfileRoutingModule, ProductCardModule],
    declarations: [ProfileComponent, ProfilePageComponent]
})
export class ProfileModule {}
