import { Module } from "@nestjs/common";
import { ConnectCommandHandler } from "./user/connect-command-handler";
import { InfrastructureModule } from "../infrastructure/infrastructure.module";
import { UserModule } from "../domain/user/user.module";
import { ViewsModule } from "../views/views.module";

@Module({
    providers: [ConnectCommandHandler],
    exports: [ConnectCommandHandler],
    imports: [InfrastructureModule, UserModule, ViewsModule]
})
export class CommandsModule {}
