import { ClientRepository } from "./client-repository";
import { Connection } from "typeorm";
import { Collection } from "mongodb";
import { cleanUpMongo, getCollection, MONGO_MODULE } from "../test-utils/mongo";
import { Test } from "@nestjs/testing";

let repository: ClientRepository;
let collection: Collection<any>;
let connection: Connection;

beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
        imports: [MONGO_MODULE],
        providers: [ClientRepository]
    }).compile();

    repository = moduleRef.get(ClientRepository);
    connection = moduleRef.get(Connection);
    collection = getCollection("clients", connection);
    await collection.deleteMany({});
});

afterEach(async () => {
    await cleanUpMongo(connection);
});

test("findByApplicationId - returns undefined for no match", async () => {
    await collection.insertOne({
        applicationId: "the-id",
        applicationSecret: "the-secret",
        applicationName: "the-name"
    });

    const found = await repository.findByApplicationId("other-id");
    expect(found).toBeUndefined();
});

test("findByApplicationId - returns client for match", async () => {
    await collection.insertOne({
        applicationId: "the-id",
        applicationSecret: "the-secret",
        applicationName: "the-name"
    });

    const found = await repository.findByApplicationId("the-id");
    expect(found.applicationSecret).toBe("the-secret");
    expect(found.applicationId).toBe("the-id");
    expect(found.applicationName).toBe("the-name");
});
