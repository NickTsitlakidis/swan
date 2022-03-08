import { Module } from "@nestjs/common";
import { INFRASTRUCTURE_DOCUMENTS, InfrastructureModule } from "./infrastructure/infrastructure.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";
import { union } from "lodash";
import { WinstonModule } from "nest-winston";
import * as winston from "winston";
import { utilities } from "nest-winston";
import { LoggerOptions } from "winston";
import { VIEW_DOCUMENTS } from "./views/views.module";
import { CommandsModule } from "./commands/commands.module";
import { SECURITY_DOCUMENTS } from "./security/security.module";
import { RestModule } from "./rest/rest.module";

const typeOrmFactory = async (configService: ConfigService): Promise<TypeOrmModuleOptions> => {
    return {
        logging: ["log", "info", "query", "error"],
        type: "mongodb",
        url: configService.get<string>("MONGO_URI"),
        entities: union(INFRASTRUCTURE_DOCUMENTS, VIEW_DOCUMENTS, SECURITY_DOCUMENTS),
        useUnifiedTopology: true
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
        InfrastructureModule,
        CommandsModule,
        RestModule
    ]
})
export class AppModule {}
