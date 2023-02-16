import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AppRoutingModule } from "./app-routing.module";
import { CoreModule } from "./@core/core.module";
import { ThemeModule } from "./@theme/theme.module";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { ContractsModule } from "./@core/contracts.module";
import { ToastModule } from "primeng/toast";
import { MobxAngularModule } from "mobx-angular";
import { HttpRequestsInterceptor } from "./@core/interceptors/http.interceptor";
import { HdWalletAdapterModule, WalletStore } from "@heavy-duty/wallet-adapter";
import { AppBrowserComponent } from "./app-browser.component";
import { ChainsModule } from "./@core/services/chains/chains.module";
import { SelectWalletDialogModule } from "./@theme/components/select-wallet-dialog/select-wallet-dialog.module";
import { DialogService } from "primeng/dynamicdialog";

@NgModule({
    declarations: [AppBrowserComponent],
    imports: [
        BrowserModule.withServerTransition({ appId: "serverApp" }),
        AppRoutingModule,
        CoreModule.forRoot(),
        ThemeModule.forRoot(),
        BrowserAnimationsModule,
        HttpClientModule,
        ContractsModule,
        ToastModule,
        MobxAngularModule,
        ChainsModule,
        SelectWalletDialogModule,
        HdWalletAdapterModule.forRoot({ autoConnect: true })
    ],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: HttpRequestsInterceptor, multi: true },
        WalletStore,
        DialogService
    ],
    bootstrap: [AppBrowserComponent]
})
export class AppBrowserModule {}
