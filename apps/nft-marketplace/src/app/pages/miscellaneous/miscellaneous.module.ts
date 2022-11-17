import { NgModule } from "@angular/core";

import { ThemeModule } from "../../@theme/theme.module";
import { MiscellaneousRoutingModule } from "./miscellaneous-routing.module";
import { MiscellaneousComponent } from "./miscellaneous.component";
import { NotFoundComponent } from "./not-found/not-found.component";
import { ButtonModule } from "primeng/button";

@NgModule({
    imports: [ThemeModule, MiscellaneousRoutingModule, ButtonModule],
    declarations: [MiscellaneousComponent, NotFoundComponent]
})
export class MiscellaneousModule {}
