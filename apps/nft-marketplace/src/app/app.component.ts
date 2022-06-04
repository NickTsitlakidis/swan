import { Component, OnInit } from "@angular/core";
import { NbIconLibraries } from "@nebular/theme";
import { LocalStorageService } from "ngx-webstorage";
import { ClientAuthService } from "./@core/services/authentication/client_auth.service";
import { AnalyticsService } from "./@core/utils/analytics.service";

@Component({
    selector: "nft-marketplace-root",
    template: "<router-outlet></router-outlet>"
})
export class AppComponent implements OnInit {
    constructor(
        private _analytics: AnalyticsService,
        private _clientAuthService: ClientAuthService,
        private _lcStorage: LocalStorageService,
        private _iconLibraries: NbIconLibraries
    ) {
        this._iconLibraries.registerFontPack("font-awesome");
    }

    ngOnInit(): void {
        this._analytics.trackPageViews();
        this._clientAuthService.getAndStoreClientToken().subscribe(() => undefined);
    }
}
