import { Module } from "@nestjs/common";
import { ClientController } from "./client/client-controller";
import { UserController } from "./user/user-controller";
import { InfrastructureModule } from "../infrastructure/infrastructure.module";
import { CqrsModule } from "@nestjs/cqrs";
import { ViewsModule } from "../views/views.module";
import { SecurityModule } from "../security/security.module";

@Module({
    controllers: [ClientController, UserController],
    imports: [CqrsModule, ViewsModule, InfrastructureModule, SecurityModule],
    providers: []
})
export class ApiModule {}
