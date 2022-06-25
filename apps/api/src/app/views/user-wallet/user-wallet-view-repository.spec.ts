import { Collection, ObjectId } from "mongodb";
import { instanceToPlain } from "class-transformer";
import { cleanUpMongo, getCollection, getMongoTestingModule } from "../../test-utils/test-modules";
import { UserWalletViewRepository } from "./user-wallet-view-repository";
import { UserWalletView } from "./user-wallet-view";
import { TestingModule } from "@nestjs/testing";

let repository: UserWalletViewRepository;
let collection: Collection<any>;
let moduleRef: TestingModule;

beforeEach(async () => {
    moduleRef = await getMongoTestingModule(UserWalletView, UserWalletViewRepository);

    repository = moduleRef.get(UserWalletViewRepository);
    collection = getCollection("user-wallet-views", moduleRef);
    await collection.deleteMany({});
});

afterEach(async () => {
    await cleanUpMongo(moduleRef);
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
    expect(found).toBeNull();
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
    expect(found).toBeNull();
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
    expect(found).toMatchObject(view);
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
    expect(found[0]).toMatchObject(view);
});

test("findByUserIdAndWalletIdAndChainId - returns matched wallet", async () => {
    const view = new UserWalletView();
    view._id = new ObjectId();
    view.address = "ad1";
    view.walletId = "w1";
    view.blockchainId = "b1";
    view.userId = "u1";

    await collection.insertOne(instanceToPlain(view));

    const found = await repository.findByUserIdAndWalletIdAndChainId("u1", "w1", "b1");
    expect(found).toMatchObject(view);
});

test("findByUserIdAndWalletIdAndChainId - returns null for no matching chain id", async () => {
    const view = new UserWalletView();
    view._id = new ObjectId();
    view.address = "ad1";
    view.walletId = "w1";
    view.blockchainId = "b1";
    view.userId = "u1";

    await collection.insertOne(instanceToPlain(view));

    const found = await repository.findByUserIdAndWalletIdAndChainId("u1", "w1", "b5");
    expect(found).toBeNull();
});

test("findByUserIdAndWalletIdAndChainId - returns null for no matching wallet id", async () => {
    const view = new UserWalletView();
    view._id = new ObjectId();
    view.address = "ad1";
    view.walletId = "w1";
    view.blockchainId = "b1";
    view.userId = "u1";

    await collection.insertOne(instanceToPlain(view));

    const found = await repository.findByUserIdAndWalletIdAndChainId("u1", "w11", "b1");
    expect(found).toBeNull();
});

test("findByUserIdAndWalletIdAndChainId - returns null for no matching user id", async () => {
    const view = new UserWalletView();
    view._id = new ObjectId();
    view.address = "ad1";
    view.walletId = "w1";
    view.blockchainId = "b1";
    view.userId = "u1";

    await collection.insertOne(instanceToPlain(view));

    const found = await repository.findByUserIdAndWalletIdAndChainId("u11", "w1", "b1");
    expect(found).toBeNull();
});
