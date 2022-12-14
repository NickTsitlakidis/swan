import { Collection, ObjectId } from "mongodb";
import { TestingModule } from "@nestjs/testing";
import { cleanUpMongo, getCollection, getMongoTestingModule } from "../../test-utils/test-modules";
import { BlockchainRepository } from "./blockchain-repository";
import { Blockchain } from "./blockchain";
import { instanceToPlain } from "class-transformer";
import { buildBlockchain } from "../../test-utils/test-builders";

let repository: BlockchainRepository;
let collection: Collection<any>;
let moduleRef: TestingModule;

beforeEach(async () => {
    moduleRef = await getMongoTestingModule(Blockchain, BlockchainRepository);

    repository = moduleRef.get(BlockchainRepository);
    collection = getCollection("blockchains", moduleRef);
    await collection.deleteMany({});
});

afterEach(async () => {
    await cleanUpMongo(moduleRef);
});

test("findByIds - returns multiple blockchain matches", async () => {
    const view1 = buildBlockchain();
    const view2 = buildBlockchain();
    const view3 = buildBlockchain();

    await collection.insertOne(instanceToPlain(view1));
    await collection.insertOne(instanceToPlain(view2));
    await collection.insertOne(instanceToPlain(view3));

    const found = await repository.findByIds([view2.id, view3.id]);
    expect(found.length).toBe(2);
    expect(found[0]).toMatchObject(view2);
    expect(found[1]).toMatchObject(view3);
});

test("findByIds - returns empty array for no blockchain matches", async () => {
    const view1 = buildBlockchain();
    const view2 = buildBlockchain();
    const view3 = buildBlockchain();

    await collection.insertOne(instanceToPlain(view1));
    await collection.insertOne(instanceToPlain(view2));
    await collection.insertOne(instanceToPlain(view3));

    const found = await repository.findByIds([new ObjectId().toHexString(), new ObjectId().toHexString()]);
    expect(found.length).toBe(0);
});

test("findAll - returns empty array for empty collection", async () => {
    const found = await repository.findAll();
    expect(found.length).toBe(0);
});

test("findAll - returns all blockchains", async () => {
    const view1 = buildBlockchain();
    const view2 = buildBlockchain();
    const view3 = buildBlockchain();

    await collection.insertOne(instanceToPlain(view1));
    await collection.insertOne(instanceToPlain(view2));
    await collection.insertOne(instanceToPlain(view3));

    const found = await repository.findAll();
    expect(found.length).toBe(3);
    expect(found[0]).toMatchObject(view1);
    expect(found[1]).toMatchObject(view2);
    expect(found[2]).toMatchObject(view3);
});

test("findById - returns null for no blockchain match", async () => {
    const view1 = buildBlockchain();
    const view2 = buildBlockchain();

    await collection.insertOne(instanceToPlain(view1));
    await collection.insertOne(instanceToPlain(view2));

    const found = await repository.findById(new ObjectId().toHexString());
    expect(found).toBeNull();
});

test("findById - returns match for blockchain match", async () => {
    const view1 = buildBlockchain();
    const view2 = buildBlockchain();

    await collection.insertOne(instanceToPlain(view1));
    await collection.insertOne(instanceToPlain(view2));

    const found = await repository.findById(view2.id);
    expect(found).toMatchObject(view2);
});
