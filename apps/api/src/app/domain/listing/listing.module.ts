import { Module } from "@nestjs/common";
import { InfrastructureModule } from "../../infrastructure/infrastructure.module";
import { ListingFactory } from "./listing-factory";

@Module({
    imports: [InfrastructureModule],
    providers: [ListingFactory],
    exports: [ListingFactory]
})
export class ListingModule {}
