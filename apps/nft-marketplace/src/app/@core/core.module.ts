import { ModuleWithProviders, NgModule, Optional, SkipSelf } from "@angular/core";
import { CommonModule } from "@angular/common";

import { throwIfAlreadyLoaded } from "./module-import-guard";
import { AnalyticsService } from "./utils";

export const CORE_PROVIDERS = [AnalyticsService];

@NgModule({
    imports: [CommonModule],
    exports: [],
    declarations: []
})
export class CoreModule {
    constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
        throwIfAlreadyLoaded(parentModule, "CoreModule");
    }

    static forRoot(): ModuleWithProviders<CoreModule> {
        return {
            ngModule: CoreModule,
            providers: [...CORE_PROVIDERS]
        };
    }
}
