import { NgModule } from "@angular/core";
import { Erc721Factory, SwanNftFactory } from "@swan/contracts";

@NgModule({
    providers: [
        {
            provide: Erc721Factory,
            useValue: new Erc721Factory()
        },
        {
            provide: SwanNftFactory,
            useValue: new SwanNftFactory()
        }
    ]
})
export class ContractsModule {}
