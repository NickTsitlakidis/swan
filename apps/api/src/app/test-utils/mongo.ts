import { union } from "lodash";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Connection } from "typeorm";
import { Collection, MongoClient } from "mongodb";
import { VIEW_DOCUMENTS } from "../views/views.module";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { EntityManager } from "@mikro-orm/mongodb";
import { Test, TestingModule } from "@nestjs/testing";
import { MikroORM } from "@mikro-orm/core";

export const MONGO_MODULE = TypeOrmModule.forRoot({
    entities: union(VIEW_DOCUMENTS),
    type: "mongodb",
    url: process.env.MONGO_URL,
    synchronize: true,
    useUnifiedTopology: true
});

export async function getMongoModule(entityClass, entityRepository): Promise<TestingModule> {
    return Test.createTestingModule({
        imports: [MikroOrmModule.forRoot({
            type: "mongo",
            validateRequired: false,
            forceUndefined: true,
            autoLoadEntities: true,
            tsNode: true,
            debug: true,
            allowGlobalContext: true,
            clientUrl: process.env.MONGO_URL
        }), MikroOrmModule.forFeature([entityClass]) ],
        providers: [entityRepository]
    }).compile();
}

export function getCollection(collectionName: string, ormObject: Connection | TestingModule): Collection<any> {
    if (ormObject instanceof TestingModule) {
        return ormObject.get(EntityManager).getCollection(collectionName) as any;
    }

    const client: MongoClient = (ormObject.driver as any).queryRunner.databaseConnection;
    return client.db().collection(collectionName);
}

export function cleanUpMongo(connectionOrModule: Connection | TestingModule): Promise<void> {
    return connectionOrModule instanceof TestingModule ? connectionOrModule.get(MikroORM).close(true) : connectionOrModule.close();
}
