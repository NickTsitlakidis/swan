import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";

import { NbMenuModule, NbSidebarService } from "@nebular/theme";
import { WalletStore } from "@heavy-duty/wallet-adapter";

import { AppComponent } from "./app.component";
import { ThemeModule } from "./@theme/theme.module";
import { CoreModule } from "./@core/core.module";
import { AppRoutingModule } from "./app-routing.module";
import { HttpRequestsInterceptor } from "./@core/interceptors/http.interceptor";
import { NgxWebstorageModule } from "ngx-webstorage";

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        NbMenuModule.forRoot(),
        AppRoutingModule,
        CoreModule.forRoot(),
        ThemeModule.forRoot(),
        NgxWebstorageModule.forRoot({
            prefix: "",
            separator: "",
            caseSensitive: true
        }),
        HttpClientModule
    ],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: HttpRequestsInterceptor, multi: true },
        NbSidebarService,
        WalletStore
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}