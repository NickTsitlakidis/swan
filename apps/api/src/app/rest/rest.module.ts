import { Module } from "@nestjs/common";
import { ClientController } from "./client-controller";
import { UserController } from "./user-controller";
import { InfrastructureModule } from "../infrastructure/infrastructure.module";
import { CqrsModule } from "@nestjs/cqrs";
import { ViewsModule } from "../views/views.module";
import { SecurityModule } from "../security/security.module";
import { SupportController } from "./support-controller";
import { QueriesModule } from "../queries/queries.module";
import { CollectionController } from "./collection-controller";

@Module({
    controllers: [ClientController, UserController, SupportController, CollectionController],
    imports: [CqrsModule, ViewsModule, InfrastructureModule, SecurityModule, QueriesModule],
    providers: []
})
export class RestModule {}
