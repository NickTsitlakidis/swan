import { NgModule } from "@angular/core";
import { Erc721Factory, SwanMarketplaceFactory, SwanNftFactory } from "@swan/contracts";

@NgModule({
    providers: [
        {
            provide: Erc721Factory,
            useValue: new Erc721Factory()
        },
        {
            provide: SwanMarketplaceFactory,
            useValue: new SwanMarketplaceFactory()
        },
        {
            provide: SwanNftFactory,
            useValue: new SwanNftFactory()
        }
    ]
})
export class ContractsModule {}
