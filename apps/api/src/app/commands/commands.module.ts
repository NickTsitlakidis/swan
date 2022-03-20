import { Module } from "@nestjs/common";
import { InfrastructureModule } from "../infrastructure/infrastructure.module";
import { UserModule } from "../domain/user/user.module";
import { ViewsModule } from "../views/views.module";
import { StartSignatureAuthenticationExecutor } from "./authentication/start-signature-authentication-executor";
import { CompleteSignatureAuthenticationExecutor } from "./authentication/complete-signature-authentication-executor";
import { SecurityModule } from "../security/security.module";

@Module({
    providers: [StartSignatureAuthenticationExecutor, CompleteSignatureAuthenticationExecutor],
    exports: [StartSignatureAuthenticationExecutor, CompleteSignatureAuthenticationExecutor],
    imports: [InfrastructureModule, UserModule, ViewsModule, SecurityModule]
})
export class CommandsModule {}
