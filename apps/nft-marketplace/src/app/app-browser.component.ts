import { Component, OnInit } from "@angular/core";
import { AnalyticsService } from "./@core/utils";
import { WalletRegistryService } from "./@core/services/chains/wallet-registry.service";
import { UserStore } from "./@core/store/user-store";
import { PrimeNGConfig } from "primeng/api";

@Component({
    selector: "swan-root",
    templateUrl: "./app.component.html"
})
export class AppBrowserComponent implements OnInit {
    constructor(
        private _analytics: AnalyticsService,
        private _walletRegistry: WalletRegistryService,
        private _primengConfig: PrimeNGConfig,
        private _userStore: UserStore
    ) {}

    ngOnInit(): void {
        this._analytics.trackPageViews();
        this._walletRegistry.populateRegistry();
        this._primengConfig.ripple = true;
        this._userStore.refreshUser();
    }
}