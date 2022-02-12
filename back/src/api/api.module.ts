import { Module } from "@nestjs/common";
import { TestController } from "./controllers/test-controller";
import { SecurityModule } from "../security/security.module";
import { JwtModule, JwtModuleOptions } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { UserGuard } from "./security/user-guard";

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

@Module({
    controllers: [TestController],
    imports: [
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: jwtFactory
        }),
        SecurityModule
    ],
    providers: [UserGuard]
})
export class ApiModule {}
