import { Component, OnInit } from "@angular/core";
import { TokenDto } from "@nft-marketplace/common";
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
        private _lcStorage: LocalStorageService
    ) {}

    ngOnInit(): void {
        this._analytics.trackPageViews();
        this._clientAuthService.getClientToken().subscribe((res: TokenDto) => {
            this._lcStorage.store("clientTokenValue", res.tokenValue);
            this._lcStorage.store("clientExpiresAt", res.expiresAt);
        });
    }
}
