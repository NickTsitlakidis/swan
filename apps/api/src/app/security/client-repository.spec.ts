import { ClientRepository } from "./client-repository";
import { Collection } from "mongodb";
import { cleanUpMongo, getCollection, getMongoTestingModule } from "../test-utils/test-modules";
import { TestingModule } from "@nestjs/testing";
import { Client } from "./client";

let repository: ClientRepository;
let collection: Collection<any>;
let moduleRef: TestingModule;

beforeEach(async () => {
    moduleRef = await getMongoTestingModule(Client, ClientRepository);

    repository = moduleRef.get(ClientRepository);
    collection = getCollection("clients", moduleRef);
    await collection.deleteMany({});
});

afterEach(async () => {
    await cleanUpMongo(moduleRef);
});

test("findByApplicationId - returns undefined for no match", async () => {
    await collection.insertOne({
        applicationId: "the-id",
        applicationSecret: "the-secret",
        applicationName: "the-name"
    });

    const found = await repository.findByApplicationId("other-id");
    expect(found).toBeNull();
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
