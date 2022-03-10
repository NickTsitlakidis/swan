import { Component, OnInit } from "@angular/core";
import { TokenDto } from "@nft-marketplace/common";
import { LocalStorageService } from "ngx-webstorage";
import { AuthService } from "./@core/services/auth.service";
import { AnalyticsService } from "./@core/utils/analytics.service";

@Component({
    selector: "nft-marketplace-root",
    template: "<router-outlet></router-outlet>"
})
export class AppComponent implements OnInit {
    constructor(
        private _analytics: AnalyticsService,
        private _authService: AuthService,
        private _lcStorage: LocalStorageService
    ) {}

    ngOnInit(): void {
        this._analytics.trackPageViews();
        this._authService.getClientToken().subscribe((res: TokenDto) => {
            this._lcStorage.store("tokenValue", res.tokenValue);
            this._lcStorage.store("expiresAt", res.expiresAt);
        });
    }
}
