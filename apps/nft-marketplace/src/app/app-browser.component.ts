import { Component, OnInit } from "@angular/core";
import { AnalyticsService } from "./common/utils";
import { WalletRegistryService } from "./common/services/chains/wallet-registry.service";
import { PrimeNGConfig } from "primeng/api";

@Component({
    selector: "swan-root",
    templateUrl: "./app.component.html"
})
export class AppBrowserComponent implements OnInit {
    constructor(
        private _analytics: AnalyticsService,
        private _walletRegistry: WalletRegistryService,
        private _primengConfig: PrimeNGConfig
    ) {}

    ngOnInit(): void {
        this._analytics.trackPageViews();
        this._walletRegistry.populateRegistry();
        this._primengConfig.ripple = true;
    }
}
