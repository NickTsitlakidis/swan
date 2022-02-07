import { union } from "lodash";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Connection } from "typeorm";
import { Collection, MongoClient } from "mongodb";
import { INFRASTRUCTURE_DOCUMENTS } from "../infrastructure/infrastructure.module";

export const MONGO_MODULE = TypeOrmModule.forRoot({
    entities: union(INFRASTRUCTURE_DOCUMENTS),
    type: "mongodb",
    url: process.env.MONGO_URL,
    synchronize: true,
    useUnifiedTopology: true
});

export function getCollection(
    collectionName: string,
    typeOrmConnection: Connection
): Collection<any> {
    const client: MongoClient = (typeOrmConnection.driver as any).queryRunner.databaseConnection;
    return client.db().collection(collectionName);
}

export function cleanUpMongo(typeOrmConnection: Connection, purge = false): Promise<any> {
    const client: MongoClient = (typeOrmConnection.driver as any).queryRunner.databaseConnection;

    if (purge) {
        return client
            .db()
            .collections()
            .then((existingCollections) => {
                const deletePromises = existingCollections.map((col) => col.deleteMany({}));
                return Promise.all(deletePromises);
            })
            .then(() => {
                return typeOrmConnection.close();
            });
    } else {
        return typeOrmConnection.close();
    }
}
