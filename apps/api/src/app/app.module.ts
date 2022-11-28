import { Module } from "@nestjs/common";
import { InfrastructureModule } from "./infrastructure/infrastructure.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { WinstonModule } from "nest-winston";
import * as winston from "winston";
import { utilities } from "nest-winston";
import { LoggerOptions } from "winston";
import { CommandsModule } from "./commands/commands.module";
import { RestModule } from "./rest/rest.module";
import { MikroOrmModule, MikroOrmModuleOptions } from "@mikro-orm/nestjs";
import { MongoOrmSubscriber } from "./infrastructure/mongo-orm-subscriber";
import { JobsModule } from "./jobs/jobs.module";
import {ServeStaticModule} from "@nestjs/serve-static"
import {join} from "path";

const mikroOrmFactory = async (configService: ConfigService): Promise<MikroOrmModuleOptions> => {
    return {
        autoLoadEntities: true,
        type: "mongo",
        forceUndefined: true,
        validateRequired: false,
        debug: false,
        clientUrl: configService.get<string>("MONGO_SAFE_URI"),
        subscribers: [new MongoOrmSubscriber()]
    };
};

const winstonFactory = async (configService: ConfigService): Promise<LoggerOptions> => {
    return {
        transports: [
            new winston.transports.Console({
                format: winston.format.combine(winston.format.timestamp(), utilities.format.nestLike())
            })
        ],
        level: configService.get<string>("LOG_LEVEL", "info")
    };
};

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        WinstonModule.forRootAsync({
            inject: [ConfigService],
            useFactory: winstonFactory
        }),
        MikroOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: mikroOrmFactory
        }),
        InfrastructureModule,
        CommandsModule,
        RestModule,
        JobsModule,
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'nft-marketplace'),
        }),
    ]
})
export class AppModule {}
