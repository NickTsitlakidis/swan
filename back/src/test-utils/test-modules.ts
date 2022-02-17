import { MONGO_MODULE } from "./mongo";
import { utilities, WinstonModule } from "nest-winston";
import * as winston from "winston";

export const TEST_MODULES = [
    MONGO_MODULE,
    WinstonModule.forRoot({
        transports: [
            new winston.transports.Console({
                format: winston.format.combine(winston.format.timestamp(), utilities.format.nestLike())
            })
        ],
        level: "debug"
    })
];
