import { APP_INITIALIZER, ErrorHandler, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AppRoutingModule } from "./app-routing.module";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { ToastModule } from "primeng/toast";
import { MobxAngularModule } from "mobx-angular";
import { HttpRequestsInterceptor } from "./common/interceptors/http.interceptor";
import { HdWalletAdapterModule, WalletStore } from "@heavy-duty/wallet-adapter";
import { AppBrowserComponent } from "./app-browser.component";
import { ChainsModule } from "./common/services/chains/chains.module";
import { SelectWalletDialogModule } from "./common/components/select-wallet-dialog/select-wallet-dialog.module";
import { DialogService } from "primeng/dynamicdialog";
import { ClientStore } from "./common/store/client-store";
import { initializeSwan } from "./application-initializer";
import { SwanCommonModule } from "./common/swan-common.module";
import { HeaderModule } from "./common/components/header/header.module";
import { PlatformUtils } from "./common/utils/platform-utils";
import { UserStore } from "./common/store/user-store";

@NgModule({
    declarations: [AppBrowserComponent],
    imports: [
        BrowserModule.withServerTransition({ appId: "serverApp" }),
        AppRoutingModule,
        BrowserAnimationsModule,
        HttpClientModule,
        SwanCommonModule,
        HeaderModule,
        ToastModule,
        MobxAngularModule,
        ChainsModule,
        SelectWalletDialogModule,
        HdWalletAdapterModule.forRoot({ autoConnect: true })
    ],
    providers: [
        {
            provide: APP_INITIALIZER,
            useFactory: initializeSwan,
            deps: [ClientStore, PlatformUtils, UserStore],
            multi: true
        },
        { provide: HTTP_INTERCEPTORS, useClass: HttpRequestsInterceptor, multi: true },
        WalletStore,
        DialogService
    ],
    bootstrap: [AppBrowserComponent]
})
export class AppBrowserModule {}
