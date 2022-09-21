import { Module } from "@nestjs/common";
import { Erc721DeploymentHistory, Erc721Factory, SwanNftFactory } from "@swan/contracts";

@Module({
    providers: [
        {
            provide: Erc721Factory,
            useValue: new Erc721Factory()
        },
        {
            provide: SwanNftFactory,
            useValue: new SwanNftFactory()
        },
        {
            provide: Erc721DeploymentHistory,
            useValue: new Erc721DeploymentHistory()
        }
    ],
    exports: [Erc721Factory, SwanNftFactory, Erc721DeploymentHistory]
})
export class ContractsModule {}
