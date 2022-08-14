import { Module } from "@nestjs/common";
import { Erc721Factory, SwanNftFactory } from "@swan/contracts";

@Module({
    providers: [
        {
            provide: Erc721Factory,
            useValue: new Erc721Factory()
        },
        {
            provide: SwanNftFactory,
            useValue: new SwanNftFactory()
        }
    ],
    exports: [Erc721Factory, SwanNftFactory]
})
export class ContractsModule {}
