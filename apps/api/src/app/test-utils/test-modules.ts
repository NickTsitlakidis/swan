import { Test, TestingModule } from "@nestjs/testing";
import { createMock } from "@golevelup/ts-jest";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Collection } from "mongodb";
import { EntityManager } from "@mikro-orm/mongodb";
import { MikroORM } from "@mikro-orm/core";
import { MongoOrmSubscriber } from "../infrastructure/mongo-orm-subscriber";
import { ConfigModule } from "@nestjs/config";

export function getUnitTestingModule(testClass: any): Promise<TestingModule> {
    return Test.createTestingModule({ providers: [testClass] })
        .useMocker((token) => {
            if (typeof token === "function") {
                return createMock();
            }
        })
        .compile();
}

export async function getMongoTestingModule(entityClass: any, entityRepository: any): Promise<TestingModule> {
    return Test.createTestingModule({
        imports: [
            ConfigModule.forRoot({ isGlobal: true }),
            MikroOrmModule.forRoot({
                type: "mongo",
                validateRequired: false,
                forceUndefined: true,
                autoLoadEntities: true,
                tsNode: true,
                allowGlobalContext: true,
                clientUrl: process.env.MONGO_URL,
                subscribers: [new MongoOrmSubscriber()]
            }),
            MikroOrmModule.forFeature([entityClass])
        ],
        providers: [entityRepository]
    }).compile();
}

export function getCollection(collectionName: string, ormObject: TestingModule): Collection<any> {
    return ormObject.get(EntityManager).getCollection(collectionName) as any;
}

export function cleanUpMongo(connectionOrModule: TestingModule): Promise<void> {
    return connectionOrModule.get(MikroORM).close(true);
}
