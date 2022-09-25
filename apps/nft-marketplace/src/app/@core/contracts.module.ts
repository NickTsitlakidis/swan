import { NgModule } from "@angular/core";
import { ContractFactory } from "@swan/contracts";

@NgModule({
    providers: [
        {
            provide: ContractFactory,
            useValue: new ContractFactory()
        }
    ]
})
export class ContractsModule {}
