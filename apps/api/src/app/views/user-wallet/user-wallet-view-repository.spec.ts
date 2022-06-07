import { Collection, ObjectId } from "mongodb";
import { Connection } from "typeorm";
import { Test } from "@nestjs/testing";
import { instanceToPlain } from "class-transformer";
import { cleanUpMongo, getCollection, MONGO_MODULE } from "../../test-utils/mongo";
import { UserWalletViewRepository } from "./user-wallet-view-repository";
import { UserWalletView } from "./user-wallet-view";

let repository: UserWalletViewRepository;
let collection: Collection<any>;
let connection: Connection;

beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
        imports: [MONGO_MODULE],
        providers: [UserWalletViewRepository]
    }).compile();

    repository = moduleRef.get(UserWalletViewRepository);
    connection = moduleRef.get(Connection);
    collection = getCollection("user-wallet-views", connection);
    await collection.deleteMany({});
});

afterEach(async () => {
    await cleanUpMongo(connection);
});

test("findByAddressAndBlockchain - returns undefined for no address match", async () => {
    const view = new UserWalletView();
    view._id = new ObjectId();
    view.address = "ad1";
    view.walletId = "w1";
    view.blockchainId = "b1";
    view.userId = "u1";

    await collection.insertOne(instanceToPlain(view));

    const found = await repository.findByAddressAndBlockchain("ad2", "b1");
    expect(found).toBeUndefined();
});

test("findByAddressAndBlockchain - returns undefined for no blockchain match", async () => {
    const view = new UserWalletView();
    view._id = new ObjectId();
    view.address = "ad1";
    view.walletId = "w1";
    view.blockchainId = "b1";
    view.userId = "u1";

    await collection.insertOne(instanceToPlain(view));

    const found = await repository.findByAddressAndBlockchain("ad1", "b2");
    expect(found).toBeUndefined();
});

test("findByAddressAndBlockchain - returns matched wallet", async () => {
    const view = new UserWalletView();
    view._id = new ObjectId();
    view.address = "ad1";
    view.walletId = "w1";
    view.blockchainId = "b1";
    view.userId = "u1";

    await collection.insertOne(instanceToPlain(view));

    const found = await repository.findByAddressAndBlockchain("ad1", "b1");
    expect(found).toEqual(view);
});

test("save - persists wallet view", async () => {
    const view = new UserWalletView();
    view._id = new ObjectId();
    view.address = "ad1";
    view.walletId = "w1";
    view.blockchainId = "b1";
    view.userId = "u1";

    const saved = await repository.save(view);
    expect(saved).toEqual(view);

    const found = await collection.find({ _id: view._id }).toArray();
    expect(found.length).toBe(1);
    expect(found[0]).toEqual(view);
});
