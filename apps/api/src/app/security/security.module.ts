import { RefreshToken } from "./refresh-token";
import { Module } from "@nestjs/common";
import { JwtModule, JwtModuleOptions } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";
import { ViewsModule } from "../views/views.module";
import { InfrastructureModule } from "../infrastructure/infrastructure.module";
import { ClientRepository } from "./client-repository";
import { ClientTokenIssuer } from "./client-token-issuer";
import { UserTokenIssuer } from "./user-token-issuer";
import { RefreshTokenRepository } from "./refresh-token-repository";
import { AddressAuthenticationRepository } from "./address-authentication-repository";
import { AddressAuthentication } from "./address-authentication";
import { Client } from "./client";

const jwtFactory = async (configService: ConfigService): Promise<JwtModuleOptions> => {
    const privateKey = new Buffer(configService.get("ES256_PRIVATE_KEY"), "base64").toString("ascii");

    const publicKey = new Buffer(configService.get("ES256_PUBLIC_KEY"), "base64").toString("ascii");

    return {
        privateKey: privateKey,
        publicKey: publicKey
    };
};

export const SECURITY_DOCUMENTS = [RefreshToken, AddressAuthentication, Client];

@Module({
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
        ClientRepository,
        ClientTokenIssuer,
        UserTokenIssuer,
        RefreshTokenRepository,
        AddressAuthenticationRepository
    ],
    exports: [
        ClientRepository,
        ClientTokenIssuer,
        UserTokenIssuer,
        RefreshTokenRepository,
        AddressAuthenticationRepository,
        JwtModule
    ]
})
export class SecurityModule {}