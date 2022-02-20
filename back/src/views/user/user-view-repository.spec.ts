import { Collection, ObjectId } from "mongodb";
import { Connection } from "typeorm";
import { Test } from "@nestjs/testing";
import { UserViewRepository } from "./user-view-repository";
import { instanceToPlain } from "class-transformer";
import { UserView } from "./user-view";
import { cleanUpMongo, getCollection, MONGO_MODULE } from "../../test-utils/mongo";

let repository: UserViewRepository;
let collection: Collection<any>;
let connection: Connection;

beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
        imports: [MONGO_MODULE],
        providers: [UserViewRepository]
    }).compile();

    repository = moduleRef.get(UserViewRepository);
    connection = moduleRef.get(Connection);
    collection = getCollection("user-views", connection);
    await collection.deleteMany({});
});

afterEach(async () => {
    await cleanUpMongo(connection);
});

test("findById - returns match", async () => {
    const view = new UserView();
    view._id = new ObjectId();
    view.walletAddress = "the-address";

    await collection.insertOne(instanceToPlain(view));

    const found = await repository.findById(view.id);
    expect(found).toEqual(view);
});

test("findById - returns undefined for no match", async () => {
    const view = new UserView();
    view._id = new ObjectId();
    view.walletAddress = "the-address";

    await collection.insertOne(instanceToPlain(view));

    const found = await repository.findById(new ObjectId().toHexString());
    expect(found).toBeUndefined();
});

test("findByWalletAddress - returns match", async () => {
    const view = new UserView();
    view._id = new ObjectId();
    view.walletAddress = "the-address";

    await collection.insertOne(instanceToPlain(view));

    const found = await repository.findByWalletAddress(view.walletAddress);
    expect(found).toEqual(view);
});

test("findByWalletAddress - returns undefined for no match", async () => {
    const view = new UserView();
    view._id = new ObjectId();
    view.walletAddress = "the-address";

    await collection.insertOne(instanceToPlain(view));

    const found = await repository.findByWalletAddress("nooooop");
    expect(found).toBeUndefined();
});

test("save - persists view", async () => {
    const view = new UserView();
    view._id = new ObjectId();
    view.walletAddress = "the-address";

    const saved = await repository.save(view);
    expect(saved).toEqual(view);

    const found = await collection.find({ _id: view._id }).toArray();
    expect(found.length).toBe(1);
    expect(found[0]).toEqual(view);
});
