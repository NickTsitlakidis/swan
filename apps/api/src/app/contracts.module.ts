import { Module } from "@nestjs/common";
import { ContractFactory } from "@swan/contracts";

@Module({
    providers: [
        {
            provide: ContractFactory,
            useValue: new ContractFactory()
        }
    ],
    exports: [ContractFactory]
})
export class ContractsModule {}
