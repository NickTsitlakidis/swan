import { Component, OnInit } from "@angular/core";
import { ClientAuthService } from "./@core/services/authentication/client_auth.service";
import { AnalyticsService } from "./@core/utils";
import { WalletRegistryService } from "./@core/services/chains/wallet-registry.service";
import { PrimeNGConfig } from "primeng/api";

@Component({
    selector: "nft-marketplace-root",
    templateUrl: "./app.component.html"
})
export class AppComponent implements OnInit {
    constructor(
        private _analytics: AnalyticsService,
        private _clientAuthService: ClientAuthService,
        private _walletRegistry: WalletRegistryService,
        private primengConfig: PrimeNGConfig
    ) {}

    ngOnInit(): void {
        this._analytics.trackPageViews();
        this._clientAuthService.getAndStoreClientToken().subscribe(() => {
            this._walletRegistry.populateRegistry();
            this.primengConfig.ripple = true;
        });
    }
}
