import { APP_INITIALIZER, NgModule } from "@angular/core";
import { ServerModule } from "@angular/platform-server";

import { AppServerComponent } from "./app-server.component";
import { AppRoutingModule } from "./app-routing.module";
import { ThemeModule } from "./@theme/theme.module";
import { ToastModule } from "primeng/toast";
import { WalletRegistryService } from "./@core/services/chains/wallet-registry.service";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { HttpRequestsInterceptor } from "./@core/interceptors/http.interceptor";
import { BrowserModule } from "@angular/platform-browser";
import { GetUserWalletService } from "./@core/services/chains/get-user-wallet.service";
import { initializeSwan } from "./application-initializer";
import { ClientStore } from "./@core/store/client-store";

@NgModule({
    declarations: [AppServerComponent],
    imports: [
        ServerModule,
        AppRoutingModule,
        ThemeModule.forRoot(),
        ToastModule,
        BrowserModule.withServerTransition({ appId: "serverApp" })
    ],
    providers: [
        {
            provide: WalletRegistryService,
            useValue: undefined
        },
        {
            provide: GetUserWalletService,
            useValue: undefined
        },
        { provide: APP_INITIALIZER, useFactory: initializeSwan, deps: [ClientStore], multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: HttpRequestsInterceptor, multi: true }
    ],
    bootstrap: [AppServerComponent]
})
export class AppServerModule {}
