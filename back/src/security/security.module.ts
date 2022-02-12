import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { InfrastructureModule } from "../infrastructure/infrastructure.module";
import { JwtModule, JwtModuleOptions, JwtService } from "@nestjs/jwt";
import { ClientGuard } from "../api/security/client-guard";
import { UserGuard } from "../api/security/user-guard";

@Module({})
export class SecurityModule {}
