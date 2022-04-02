import { Module } from "@nestjs/common";
import { ClientController } from "./client/client-controller";
import { UserController } from "./user/user-controller";
import { InfrastructureModule } from "../infrastructure/infrastructure.module";
import { CqrsModule } from "@nestjs/cqrs";
import { ViewsModule } from "../views/views.module";
import { SecurityModule } from "../security/security.module";
import { SystemController } from "./system/system-controller";
import { QueriesModule } from "../queries/queries.module";
import {CollectionController} from "./collection/collection-controller";

@Module({
    controllers: [ClientController, UserController, SystemController, CollectionController],
    imports: [CqrsModule, ViewsModule, InfrastructureModule, SecurityModule, QueriesModule],
    providers: []
})
export class RestModule {}
