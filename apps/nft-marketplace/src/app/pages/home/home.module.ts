import { NgModule } from "@angular/core";

import { ThemeModule } from "../../@theme/theme.module";
import { HomePageComponent } from "./home-page/home-page.component";
import { HomeRoutingModule } from "./home-routing.module";
import { HomeComponent } from "./home.component";

@NgModule({
    imports: [ThemeModule, HomeRoutingModule],
    declarations: [HomeComponent, HomePageComponent]
})
export class HomeModule {}
