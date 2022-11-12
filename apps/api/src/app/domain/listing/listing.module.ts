import { Module } from "@nestjs/common";
import { InfrastructureModule } from "../../infrastructure/infrastructure.module";
import { ListingFactory } from "./listing-factory";
import { ListingActivator } from "./listing-activator";
import { ViewsModule } from "../../views/views.module";
import { ContractsModule } from "../../contracts.module";
import { SupportModule } from "../../support/support.module";

@Module({
    imports: [InfrastructureModule, ViewsModule, ContractsModule, SupportModule],
    providers: [ListingFactory, ListingActivator],
    exports: [ListingFactory, ListingActivator]
})
export class ListingModule {}
