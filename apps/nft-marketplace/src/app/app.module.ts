import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { AppComponent } from "./app.component";
import { ThemeModule } from "./@theme/theme.module";
import { CoreModule } from "./@core/core.module";
import { AppRoutingModule } from "./app-routing.module";
import { NbMenuModule, NbSidebarService } from "@nebular/theme";
@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        NbMenuModule.forRoot(),
        AppRoutingModule,
        CoreModule.forRoot(),
        ThemeModule.forRoot()
    ],
    providers: [NbSidebarService],
    bootstrap: [AppComponent]
})
export class AppModule {}
