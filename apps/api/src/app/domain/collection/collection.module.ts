import { Module } from "@nestjs/common";
import { InfrastructureModule } from "../../infrastructure/infrastructure.module";
import { CollectionFactory } from "./collection-factory";

@Module({
    imports: [InfrastructureModule],
    providers: [CollectionFactory],
    exports: [CollectionFactory]
})
export class CollectionModule {}
