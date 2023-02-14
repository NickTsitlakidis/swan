import { NgModule } from "@angular/core";
import { ServerModule } from "@angular/platform-server";

import { AppModule } from "./app.module";
import { AppServerComponent } from "./app-server.component";
import { AppRoutingModule } from "./app-routing.module";
import { CoreModule } from "./@core/core.module";
import { ThemeModule } from "./@theme/theme.module";
import { ToastModule } from "primeng/toast";

@NgModule({
    declarations: [AppServerComponent],
    imports: [AppModule, ServerModule, AppRoutingModule, CoreModule.forRoot(), ThemeModule.forRoot(), ToastModule],
    bootstrap: [AppServerComponent]
})
export class AppServerModule {}
