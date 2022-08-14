import { Collection, ObjectId } from "mongodb";
import { TestingModule } from "@nestjs/testing";
import { cleanUpMongo, getCollection, getMongoTestingModule } from "../../test-utils/test-modules";
import { BlockchainRepository } from "./blockchain-repository";
import { Blockchain } from "./blockchain";
import { instanceToPlain } from "class-transformer";

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
    const view1 = new Blockchain();
    view1._id = new ObjectId();

    const view2 = new Blockchain();
    view2._id = new ObjectId();

    const view3 = new Blockchain();
    view3._id = new ObjectId();

    await collection.insertOne(instanceToPlain(view1));
    await collection.insertOne(instanceToPlain(view2));
    await collection.insertOne(instanceToPlain(view3));

    const found = await repository.findByIds([view2.id, view3.id]);
    expect(found.length).toBe(2);
    expect(found[0]).toMatchObject(view2);
    expect(found[1]).toMatchObject(view3);
});

test("findByIds - returns empty array for no blockchain matches", async () => {
    const view1 = new Blockchain();
    view1._id = new ObjectId();

    const view2 = new Blockchain();
    view2._id = new ObjectId();

    const view3 = new Blockchain();
    view3._id = new ObjectId();

    await collection.insertOne(instanceToPlain(view1));
    await collection.insertOne(instanceToPlain(view2));
    await collection.insertOne(instanceToPlain(view3));

    const found = await repository.findByIds([new ObjectId().toHexString(), new ObjectId().toHexString()]);
    expect(found.length).toBe(0);
});
