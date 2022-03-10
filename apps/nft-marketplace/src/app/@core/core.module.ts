import { ModuleWithProviders, NgModule, Optional, SkipSelf } from "@angular/core";
import { CommonModule } from "@angular/common";

import { throwIfAlreadyLoaded } from "./module-import-guard";
import { AnalyticsService } from "./utils";
import { HdWalletAdapterModule } from "@heavy-duty/wallet-adapter";

export const CORE_PROVIDERS = [AnalyticsService];

@NgModule({
    imports: [CommonModule, HdWalletAdapterModule.forRoot({ autoConnect: true })],
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
