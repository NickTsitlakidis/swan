import { Module } from "@nestjs/common";
import { InfrastructureModule } from "../../infrastructure/infrastructure.module";
import { UserFactory } from "./user-factory";

@Module({
    imports: [InfrastructureModule],
    providers: [UserFactory],
    exports: [UserFactory]
})
export class UserModule {}
