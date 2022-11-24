import { Collection, ObjectId } from "mongodb";
import { instanceToPlain } from "class-transformer";
import { cleanUpMongo, getCollection, getMongoTestingModule } from "../../test-utils/test-modules";
import { UserWalletViewRepository } from "./user-wallet-view-repository";
import { UserWalletView } from "./user-wallet-view";
import { TestingModule } from "@nestjs/testing";
import { buildUserWalletView } from "../../test-utils/test-builders";

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
    const view = buildUserWalletView();
    await collection.insertOne(instanceToPlain(view));
    const found = await repository.findByAddressAndBlockchain("other", view.blockchainId);
    expect(found).toBeNull();
});

test("findByIds - returns empty array for no matches", async () => {
    const view1 = buildUserWalletView();
    const view2 = buildUserWalletView();
    const view3 = buildUserWalletView();
    await collection.insertMany([instanceToPlain(view1), instanceToPlain(view2), instanceToPlain(view3)]);

    const found = await repository.findByIds(["other1", "other2"]);
    expect(found.length).toBe(0);
});

test("findByIds - returns matching views of all ids", async () => {
    const view1 = buildUserWalletView();
    const view2 = buildUserWalletView();
    const view3 = buildUserWalletView();
    await collection.insertMany([instanceToPlain(view1), instanceToPlain(view2), instanceToPlain(view3)]);

    const found = await repository.findByIds([view1.id, view2.id, view3.id]);
    expect(found.length).toBe(3);
    expect(found).toMatchObject([view1, view2, view3]);
});

test("findByIds - returns matching views of some ids", async () => {
    const view1 = buildUserWalletView();
    const view2 = buildUserWalletView();
    const view3 = buildUserWalletView();
    await collection.insertMany([instanceToPlain(view1), instanceToPlain(view2), instanceToPlain(view3)]);

    const found = await repository.findByIds([view1.id, "other", view3.id]);
    expect(found.length).toBe(2);
    expect(found).toMatchObject([view1, view3]);
});

test("findByAddressAndBlockchain - returns undefined for no blockchain match", async () => {
    const view = buildUserWalletView();
    await collection.insertOne(instanceToPlain(view));

    const found = await repository.findByAddressAndBlockchain(view.address, "other");
    expect(found).toBeNull();
});

test("findByAddressAndBlockchain - returns matched wallet", async () => {
    const view = buildUserWalletView();
    await collection.insertOne(instanceToPlain(view));

    const found = await repository.findByAddressAndBlockchain(view.address, view.blockchainId);
    expect(found).toMatchObject(view);
});

test("save - persists wallet view", async () => {
    const view = buildUserWalletView();
    const saved = await repository.save(view);
    expect(saved).toEqual(view);

    const found = await collection.find({ _id: view._id }).toArray();
    expect(found.length).toBe(1);
    expect(found[0]).toMatchObject(view);
});

test("findByUserIdAndWalletIdAndChainId - returns matched wallet", async () => {
    const view = buildUserWalletView();

    await collection.insertOne(instanceToPlain(view));

    const found = await repository.findByUserIdAndWalletIdAndChainId(view.userId, view.walletId, view.blockchainId);
    expect(found).toMatchObject(view);
});

test("findByUserIdAndWalletIdAndChainId - returns null for no matching chain id", async () => {
    const view = buildUserWalletView();
    await collection.insertOne(instanceToPlain(view));

    const found = await repository.findByUserIdAndWalletIdAndChainId("u1", "w1", "b5");
    expect(found).toBeNull();
});

test("findByUserIdAndWalletIdAndChainId - returns null for no matching wallet id", async () => {
    const view = buildUserWalletView();
    await collection.insertOne(instanceToPlain(view));

    const found = await repository.findByUserIdAndWalletIdAndChainId("u1", "w11", "b1");
    expect(found).toBeNull();
});

test("findByUserIdAndWalletIdAndChainId - returns null for no matching user id", async () => {
    const view = buildUserWalletView();
    await collection.insertOne(instanceToPlain(view));

    const found = await repository.findByUserIdAndWalletIdAndChainId("u11", "w1", "b1");
    expect(found).toBeNull();
});

test("findByUserId - returns single match view", async () => {
    const view1 = buildUserWalletView();
    const view2 = buildUserWalletView();
    const view3 = buildUserWalletView();

    await collection.insertOne(instanceToPlain(view1));
    await collection.insertOne(instanceToPlain(view2));
    await collection.insertOne(instanceToPlain(view3));

    const found = await repository.findByUserId(view2.userId);
    expect(found.length).toBe(1);
    expect(found[0]).toMatchObject(view2);
});

test("findByUserId - returns multiple matches", async () => {
    const view1 = buildUserWalletView();
    const view2 = buildUserWalletView();
    const view3 = buildUserWalletView();
    view3.userId = view1.userId;

    await collection.insertOne(instanceToPlain(view1));
    await collection.insertOne(instanceToPlain(view2));
    await collection.insertOne(instanceToPlain(view3));

    const found = await repository.findByUserId(view1.userId);
    expect(found.length).toBe(2);
    expect(found[0]).toMatchObject(view1);
    expect(found[1]).toMatchObject(view3);
});

test("findByUserId - returns empty array for no match", async () => {
    const view1 = buildUserWalletView();
    const view2 = buildUserWalletView();

    await collection.insertOne(instanceToPlain(view1));
    await collection.insertOne(instanceToPlain(view2));

    const found = await repository.findByUserId("something-else");
    expect(found.length).toBe(0);
});
