import { Collection, ObjectId } from "mongodb";
import { TestingModule } from "@nestjs/testing";
import { CollectionViewRepository } from "./collection-view-repository";
import { CollectionView } from "./collection-view";
import { instanceToPlain } from "class-transformer";
import { cleanUpMongo, getCollection, getMongoTestingModule } from "../../test-utils/test-modules";
import { buildCollectionView } from "../../test-utils/test-builders";

let repository: CollectionViewRepository;
let collection: Collection<any>;
let testModule: TestingModule;

beforeEach(async () => {
    testModule = await getMongoTestingModule(CollectionView, CollectionViewRepository);

    repository = testModule.get(CollectionViewRepository);
    collection = getCollection("collection-views", testModule);
    await collection.deleteMany({});
});

afterEach(async () => {
    await cleanUpMongo(testModule);
});

test("save - persists collection view", async () => {
    const view = buildCollectionView();

    const saved = await repository.save(view);
    expect(saved).toEqual(view);

    const found = await collection.find({ _id: view._id }).toArray();
    expect(found.length).toBe(1);
    expect(found[0]).toMatchObject(view);
    expect(found[0].createdAt).toBeInstanceOf(Date);
});

test("countByName - returns 0 for no match", async () => {
    const view = buildCollectionView();
    await collection.insertOne(instanceToPlain(view));

    const count = await repository.countByName("something");
    expect(count).toEqual(0);
});

test("countByName - returns 1 for match", async () => {
    const view1 = buildCollectionView();

    const view2 = buildCollectionView();

    await collection.insertOne(instanceToPlain(view1));
    await collection.insertOne(instanceToPlain(view2));

    const count = await repository.countByName(view2.name);
    expect(count).toEqual(1);
});

test("countByCustomUrl - returns 0 for no match", async () => {
    const view = buildCollectionView();
    await collection.insertOne(instanceToPlain(view));

    const count = await repository.countByCustomUrl("something");
    expect(count).toEqual(0);
});

test("countByCustomUrl - returns 1 for match", async () => {
    const view1 = buildCollectionView();
    const view2 = buildCollectionView();

    await collection.insertOne(instanceToPlain(view1));
    await collection.insertOne(instanceToPlain(view2));

    const count = await repository.countByCustomUrl(view1.customUrl);
    expect(count).toEqual(1);
});

test("findByUserIdAndId - returns match", async () => {
    const view1 = buildCollectionView();
    await collection.insertOne(instanceToPlain(view1));

    const count = await repository.findByUserIdAndId(view1.userId, view1.id);
    expect(count).toMatchObject(view1);
});

test("findByUserIdAndId - returns null for no user id match", async () => {
    const view1 = buildCollectionView();

    await collection.insertOne(instanceToPlain(view1));

    const count = await repository.findByUserIdAndId("the-non-random-user", view1.id);
    expect(count).toBeNull();
});

test("findByUserIdAndId - returns null for no id match", async () => {
    const view1 = buildCollectionView();

    await collection.insertOne(instanceToPlain(view1));

    const count = await repository.findByUserIdAndId(view1.userId, new ObjectId().toHexString());
    expect(count).toBeNull();
});
