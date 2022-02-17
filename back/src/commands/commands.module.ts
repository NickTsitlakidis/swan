import { Module } from "@nestjs/common";
import { InfrastructureModule } from "../infrastructure/infrastructure.module";
import { UserModule } from "../domain/user/user.module";
import { ViewsModule } from "../views/views.module";
import { StartAuthenticationExecutor } from "./authentication/start-authentication-executor";
import { CompleteAuthenticationExecutor } from "./authentication/complete-authentication-executor";
import { SecurityModule } from "../security/security.module";

@Module({
    providers: [StartAuthenticationExecutor, CompleteAuthenticationExecutor],
    exports: [StartAuthenticationExecutor, CompleteAuthenticationExecutor],
    imports: [InfrastructureModule, UserModule, ViewsModule, SecurityModule]
})
export class CommandsModule {}
