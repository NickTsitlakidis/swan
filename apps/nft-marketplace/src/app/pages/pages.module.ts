import { NgModule } from "@angular/core";

import { ThemeModule } from "../@theme/theme.module";
import { PagesComponent } from "./pages.component";
import { PagesRoutingModule } from "./pages-routing.module";
import { MiscellaneousModule } from "./miscellaneous/miscellaneous.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
@NgModule({
    imports: [PagesRoutingModule, ReactiveFormsModule, FormsModule, ThemeModule, MiscellaneousModule],
    declarations: [PagesComponent]
})
export class PagesModule {}
