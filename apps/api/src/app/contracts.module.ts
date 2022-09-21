import { Module } from "@nestjs/common";
import { Erc721DeploymentHistory, Erc721Factory, SwanMarketplaceFactory, SwanNftFactory } from "@swan/contracts";

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
        },
        {
            provide: SwanMarketplaceFactory,
            useValue: new SwanMarketplaceFactory()
        }
    ],
    exports: [Erc721Factory, SwanNftFactory, Erc721DeploymentHistory, SwanMarketplaceFactory]
})
export class ContractsModule {}
