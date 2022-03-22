import { Module } from "@nestjs/common";
import { InfrastructureModule } from "../infrastructure/infrastructure.module";
import { UserModule } from "../domain/user/user.module";
import { ViewsModule } from "../views/views.module";
import { StartSignatureAuthenticationExecutor } from "./user/start-signature-authentication-executor";
import { CompleteSignatureAuthenticationExecutor } from "./user/complete-signature-authentication-executor";
import { SecurityModule } from "../security/security.module";
import { ConfigModule } from "@nestjs/config";

@Module({
    providers: [StartSignatureAuthenticationExecutor, CompleteSignatureAuthenticationExecutor],
    exports: [StartSignatureAuthenticationExecutor, CompleteSignatureAuthenticationExecutor],
    imports: [InfrastructureModule, UserModule, ViewsModule, SecurityModule, ConfigModule]
})
export class CommandsModule {}
