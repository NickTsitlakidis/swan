import { RefreshToken } from "./refresh-token";
import { Module } from "@nestjs/common";
import { JwtModule, JwtModuleOptions } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";
import { ViewsModule } from "../views/views.module";
import { InfrastructureModule } from "../infrastructure/infrastructure.module";
import { ClientRepository } from "./client-repository";
import { ClientTokenIssuer } from "./client-token-issuer";
import { UserTokenIssuer } from "./user-token-issuer";
import { RefreshTokenRepository } from "./refresh-token-repository";
import { SignatureAuthenticationRepository } from "./signature-authentication-repository";
import { SignatureAuthentication } from "./signature-authentication";
import { Client } from "./client";
import { MikroOrmModule } from "@mikro-orm/nestjs";

const jwtFactory = async (configService: ConfigService): Promise<JwtModuleOptions> => {
    const privateKey = Buffer.from(configService.getOrThrow<string>("ES256_PRIVATE_KEY"), "base64").toString("ascii");

    const publicKey = Buffer.from(configService.getOrThrow<string>("ES256_PUBLIC_KEY"), "base64").toString("ascii");

    return {
        privateKey: privateKey,
        publicKey: publicKey
    };
};

@Module({
    imports: [
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: jwtFactory
        }),
        CqrsModule,
        ViewsModule,
        InfrastructureModule,
        MikroOrmModule.forFeature([Client, RefreshToken, SignatureAuthentication])
    ],
    providers: [
        ClientRepository,
        ClientTokenIssuer,
        UserTokenIssuer,
        RefreshTokenRepository,
        SignatureAuthenticationRepository
    ],
    exports: [
        ClientRepository,
        ClientTokenIssuer,
        UserTokenIssuer,
        RefreshTokenRepository,
        SignatureAuthenticationRepository,
        JwtModule
    ]
})
export class SecurityModule {}
