import { Module } from "@nestjs/common";
import { JwtModule, JwtModuleOptions } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { UserGuard } from "./security/user-guard";
import { ClientRepository } from "./security/client-repository";
import { ClientTokenIssuer } from "./security/client-token-issuer";
import { ClientController } from "./controllers/client-controller";
import { Client } from "./security/client";

const jwtFactory = async (configService: ConfigService): Promise<JwtModuleOptions> => {
    const privateKeyBuffer = new Buffer(configService.get("ES256_PRIVATE_KEY"), "base64");
    const privateKey = privateKeyBuffer.toString("ascii");

    const publicKeyBuffer = new Buffer(configService.get("ES256_PUBLIC_KEY"), "base64");
    const publicKey = publicKeyBuffer.toString("ascii");

    return {
        privateKey: privateKey,
        publicKey: publicKey
    };
};

export const API_DOCUMENTS = [Client];

@Module({
    controllers: [ClientController],
    imports: [
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: jwtFactory
        })
    ],
    providers: [UserGuard, ClientRepository, ClientTokenIssuer]
})
export class ApiModule {}
