import { NgModule } from "@angular/core";
import { ServerModule } from "@angular/platform-server";

import { AppServerComponent } from "./app-server.component";
import { AppRoutingModule } from "./app-routing.module";
import { CoreModule } from "./@core/core.module";
import { ThemeModule } from "./@theme/theme.module";
import { ToastModule } from "primeng/toast";
import { WalletRegistryService } from "./@core/services/chains/wallet-registry.service";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { HttpRequestsInterceptor } from "./@core/interceptors/http.interceptor";
import { BrowserModule } from "@angular/platform-browser";

@NgModule({
    declarations: [AppServerComponent],
    imports: [
        ServerModule,
        AppRoutingModule,
        CoreModule.forRoot(),
        ThemeModule.forRoot(),
        ToastModule,
        BrowserModule.withServerTransition({ appId: "serverApp" })
    ],
    providers: [
        {
            provide: WalletRegistryService,
            useValue: undefined
        },
        { provide: HTTP_INTERCEPTORS, useClass: HttpRequestsInterceptor, multi: true }
    ],
    bootstrap: [AppServerComponent]
})
export class AppServerModule {}
