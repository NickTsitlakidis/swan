import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AppRoutingModule } from "./app-routing.module";
import { CoreModule } from "./@core/core.module";
import { ThemeModule } from "./@theme/theme.module";
import { NgxWebstorageModule } from "ngx-webstorage";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { ContractsModule } from "./@core/contracts.module";
import { ToastModule } from "primeng/toast";
import { MobxAngularModule } from "mobx-angular";
import { HttpRequestsInterceptor } from "./@core/interceptors/http.interceptor";
import { HdWalletAdapterModule, WalletStore } from "@heavy-duty/wallet-adapter";
import { AppModule } from "./app.module";
import { AppBrowserComponent } from "./app-browser.component";
import { ChainsModule } from "./@core/services/chains/chains.module";

@NgModule({
    declarations: [AppBrowserComponent],
    imports: [
        BrowserModule.withServerTransition({ appId: "serverApp" }),
        AppModule,
        AppRoutingModule,
        CoreModule.forRoot(),
        ThemeModule.forRoot(),
        BrowserAnimationsModule,
        NgxWebstorageModule.forRoot({
            prefix: "",
            separator: "",
            caseSensitive: true
        }),
        HttpClientModule,
        ContractsModule,
        ToastModule,
        MobxAngularModule,
        ChainsModule,
        HdWalletAdapterModule.forRoot({ autoConnect: true })
    ],
    providers: [{ provide: HTTP_INTERCEPTORS, useClass: HttpRequestsInterceptor, multi: true }, WalletStore],
    bootstrap: [AppBrowserComponent]
})
export class AppBrowserModule {}
