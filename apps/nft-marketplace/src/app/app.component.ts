import { Component, OnInit } from "@angular/core";
import { AnalyticsService } from "./@core/utils/analytics.service";

@Component({
    selector: "nft-marketplace-root",
    template: "<router-outlet></router-outlet>"
})
export class AppComponent implements OnInit {
    constructor(private _analytics: AnalyticsService) {}

    ngOnInit(): void {
        this._analytics.trackPageViews();
    }
}
