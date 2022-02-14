import { Module } from "@nestjs/common";
import { JwtModule, JwtModuleOptions } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { UserGuard } from "./security/user-guard";
import { ClientRepository } from "./security/client-repository";
import { ClientTokenIssuer } from "./security/client-token-issuer";
import { ClientController } from "./controllers/client-controller";
import { Client } from "./security/client";
import { UserController } from "./controllers/user-controller";
import { RefreshToken } from "./security/refresh-token";
import { UserTokenIssuer } from "./security/user-token-issuer";
import { RefreshTokenRepository } from "./security/refresh-token-repository";
import { InfrastructureModule } from "../infrastructure/infrastructure.module";
import { CqrsModule } from "@nestjs/cqrs";
import { ViewsModule } from "../views/views.module";

const jwtFactory = async (configService: ConfigService): Promise<JwtModuleOptions> => {
    const privateKey = new Buffer(configService.get("ES256_PRIVATE_KEY"), "base64").toString(
        "ascii"
    );

    const publicKey = new Buffer(configService.get("ES256_PUBLIC_KEY"), "base64").toString("ascii");

    return {
        privateKey: privateKey,
        publicKey: publicKey
    };
};

export const API_DOCUMENTS = [Client, RefreshToken];

@Module({
    controllers: [ClientController, UserController],
    imports: [
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: jwtFactory
        }),
        CqrsModule,
        ViewsModule,
        InfrastructureModule
    ],
    providers: [
        UserGuard,
        ClientRepository,
        ClientTokenIssuer,
        UserTokenIssuer,
        RefreshTokenRepository
    ]
})
export class ApiModule {}
