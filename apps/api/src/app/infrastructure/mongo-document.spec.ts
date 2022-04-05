import { MongoDocument } from "./mongo-document";
import { Collection } from "mongodb";
import { Column, Connection, Entity, MongoRepository } from "typeorm";
import { Test } from "@nestjs/testing";
import { cleanUpMongo, getCollection } from "../test-utils/mongo";
import { TypeOrmModule } from "@nestjs/typeorm";
import { keys } from "lodash";

@Entity("test-documents")
class TestDocument extends MongoDocument {
    @Column()
    field1: string;

    @Column()
    field2: string;

    @Column()
    field3: string;
}

let repository: MongoRepository<TestDocument>;
let collection: Collection<any>;
let connection: Connection;

beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
        imports: [
            TypeOrmModule.forRoot({
                entities: [TestDocument],
                type: "mongodb",
                url: process.env.MONGO_URL,
                synchronize: true,
                useUnifiedTopology: true
            })
        ],
        providers: []
    }).compile();

    connection = moduleRef.get(Connection);
    repository = connection.getMongoRepository(TestDocument);
    collection = getCollection("test-documents", connection);
    await collection.deleteMany({});
});

afterEach(async () => {
    await cleanUpMongo(connection);
});

test("beforeInsert - null and undefined values are deleted", async () => {
    const doc = new TestDocument();
    doc.field1 = "value";
    doc.field2 = null;
    doc.field3 = undefined;

    const saved = await repository.save(doc);

    expect(saved).toEqual(doc);

    const fromMongo = await collection.find({}).toArray();
    expect(keys(fromMongo[0]).length).toBe(2);
    expect(fromMongo[0].field1).toBe("value");
});
