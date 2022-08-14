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
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { ChainsModule } from "./@core/services/chains/chains.module";
import { SupportModule } from "./@core/services/support/support.module";
import { ContractsModule } from "./@core/contracts.module";

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
        HttpClientModule,
        FontAwesomeModule,
        ChainsModule,
        SupportModule,
        ContractsModule
    ],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: HttpRequestsInterceptor, multi: true },
        NbSidebarService,
        WalletStore
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
