import { Collection, ObjectId } from "mongodb";
import { TestingModule } from "@nestjs/testing";
import { CollectionViewRepository } from "./collection-view-repository";
import { CollectionView } from "./collection-view";
import { CollectionLinksView } from "./collection-links-view";
import { instanceToPlain } from "class-transformer";
import { cloneDeep } from "lodash";
import { cleanUpMongo, getCollection, getMongoTestingModule } from "../../test-utils/test-modules";

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
    const view = new CollectionView();
    view._id = new ObjectId();
    view.categoryId = "cat-id";
    view.name = "the-collection";
    view.blockchainId = "block";
    view.customUrl = "some-url";
    view.salePercentage = 45;
    view.description = "a description";
    view.imageUrl = "collection-image";
    view.isExplicit = false;
    view.paymentToken = "ETH";
    view.links = new CollectionLinksView("ins", "dis", "tel", "web", "med");

    const saved = await repository.save(view);
    expect(saved).toEqual(view);

    const found = await collection.find({ _id: view._id }).toArray();
    expect(found.length).toBe(1);
    expect(found[0]).toMatchObject(view);
    expect(found[0].createdAt).toBeInstanceOf(Date);
});

test("countByName - returns 0 for no match", async () => {
    const view = new CollectionView();
    view._id = new ObjectId();
    view.categoryId = "cat-id";
    view.name = "the-collection";
    view.blockchainId = "block";
    view.customUrl = "some-url";
    view.salePercentage = 45;
    view.description = "a description";
    view.imageUrl = "collection-image";
    view.isExplicit = false;
    view.paymentToken = "ETH";
    view.links = new CollectionLinksView("ins", "dis", "tel", "web", "med");

    await collection.insertOne(instanceToPlain(view));

    const count = await repository.countByName("blarg");
    expect(count).toEqual(0);
});

test("countByName - returns 1 for match", async () => {
    const view1 = new CollectionView();
    view1._id = new ObjectId();
    view1.categoryId = "cat-id";
    view1.name = "the-collection";
    view1.blockchainId = "block";
    view1.customUrl = "some-url";
    view1.salePercentage = 45;
    view1.description = "a description";
    view1.imageUrl = "collection-image";
    view1.isExplicit = false;
    view1.paymentToken = "ETH";
    view1.links = new CollectionLinksView("ins", "dis", "tel", "web", "med");

    const view2 = cloneDeep(view1);
    view2._id = new ObjectId();
    view2.name = "other-name";

    await collection.insertOne(instanceToPlain(view1));
    await collection.insertOne(instanceToPlain(view2));

    const count = await repository.countByName("the-collection");
    expect(count).toEqual(1);
});

test("countByCustomUrl - returns 0 for no match", async () => {
    const view = new CollectionView();
    view._id = new ObjectId();
    view.categoryId = "cat-id";
    view.name = "the-collection";
    view.blockchainId = "block";
    view.customUrl = "some-url";
    view.salePercentage = 45;
    view.description = "a description";
    view.imageUrl = "collection-image";
    view.isExplicit = false;
    view.paymentToken = "ETH";
    view.links = new CollectionLinksView("ins", "dis", "tel", "web", "med");
    view.links.medium = "med";
    view.links.discord = "dis";
    view.links.instagram = "ins";
    view.links.telegram = "tel";
    view.links.website = "web";

    await collection.insertOne(instanceToPlain(view));

    const count = await repository.countByCustomUrl("blarg");
    expect(count).toEqual(0);
});

test("countByCustomUrl - returns 1 for match", async () => {
    const view1 = new CollectionView();
    view1._id = new ObjectId();
    view1.categoryId = "cat-id";
    view1.name = "the-collection";
    view1.blockchainId = "block";
    view1.customUrl = "some-url";
    view1.salePercentage = 45;
    view1.description = "a description";
    view1.imageUrl = "collection-image";
    view1.isExplicit = false;
    view1.paymentToken = "ETH";
    view1.links = new CollectionLinksView("ins", "dis", "tel", "web", "med");

    const view2 = cloneDeep(view1);
    view2._id = new ObjectId();
    view2.customUrl = "other-url";

    await collection.insertOne(instanceToPlain(view1));
    await collection.insertOne(instanceToPlain(view2));

    const count = await repository.countByCustomUrl("some-url");
    expect(count).toEqual(1);
});

test("findByUserIdAndId - returns match", async () => {
    const view1 = new CollectionView();
    view1._id = new ObjectId();
    view1.categoryId = "cat-id";
    view1.name = "the-collection";
    view1.blockchainId = "block";
    view1.customUrl = "some-url";
    view1.salePercentage = 45;
    view1.description = "a description";
    view1.imageUrl = "collection-image";
    view1.isExplicit = false;
    view1.paymentToken = "ETH";
    view1.userId = "the-user";
    view1.links = new CollectionLinksView("ins", "dis", "tel", "web", "med");

    await collection.insertOne(instanceToPlain(view1));

    const count = await repository.findByUserIdAndId("the-user", view1.id);
    expect(count).toMatchObject(view1);
});

test("findByUserIdAndId - returns null for no user id match", async () => {
    const view1 = new CollectionView();
    view1._id = new ObjectId();
    view1.categoryId = "cat-id";
    view1.name = "the-collection";
    view1.blockchainId = "block";
    view1.customUrl = "some-url";
    view1.salePercentage = 45;
    view1.description = "a description";
    view1.imageUrl = "collection-image";
    view1.isExplicit = false;
    view1.paymentToken = "ETH";
    view1.userId = "the-user";
    view1.links = new CollectionLinksView("ins", "dis", "tel", "web", "med");

    await collection.insertOne(instanceToPlain(view1));

    const count = await repository.findByUserIdAndId("the-other-user", view1.id);
    expect(count).toBeNull();
});

test("findByUserIdAndId - returns null for no user id match", async () => {
    const view1 = new CollectionView();
    view1._id = new ObjectId();
    view1.categoryId = "cat-id";
    view1.name = "the-collection";
    view1.blockchainId = "block";
    view1.customUrl = "some-url";
    view1.salePercentage = 45;
    view1.description = "a description";
    view1.imageUrl = "collection-image";
    view1.isExplicit = false;
    view1.paymentToken = "ETH";
    view1.userId = "the-user";
    view1.links = new CollectionLinksView("ins", "dis", "tel", "web", "med");

    await collection.insertOne(instanceToPlain(view1));

    const count = await repository.findByUserIdAndId("the-user", new ObjectId().toHexString());
    expect(count).toBeNull();
});
