import { Module } from "@nestjs/common";
import { InfrastructureModule } from "./infrastructure/infrastructure.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";
import { union } from "lodash";
import { WinstonModule } from "nest-winston";
import * as winston from "winston";
import { utilities } from "nest-winston";
import { LoggerOptions } from "winston";
import { VIEW_DOCUMENTS } from "./views/views.module";
import { CommandsModule } from "./commands/commands.module";
import { RestModule } from "./rest/rest.module";
import { MikroOrmModule, MikroOrmModuleOptions } from "@mikro-orm/nestjs";

const typeOrmFactory = async (configService: ConfigService): Promise<TypeOrmModuleOptions> => {
    return {
        logging: ["log", "info", "query", "error"],
        type: "mongodb",
        url: configService.get<string>("MONGO_URI"),
        entities: union(VIEW_DOCUMENTS),
        useUnifiedTopology: true
    };
};

const mikroOrmFactory = async (configService: ConfigService): Promise<MikroOrmModuleOptions> => {
    return {
        autoLoadEntities: true,
        type: 'mongo',
        forceUndefined: true,
        validateRequired: false,
        clientUrl: configService.get<string>("MONGO_SAFE_URI"),
    }
}

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
        ConfigModule.forRoot({}),
        WinstonModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: winstonFactory
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: typeOrmFactory
        }),
        MikroOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: mikroOrmFactory
        }),
        InfrastructureModule,
        CommandsModule,
        RestModule
    ]
})
export class AppModule {}
