import { Collection, ObjectId } from "mongodb";
import { Connection } from "typeorm";
import { Test } from "@nestjs/testing";
import { cleanUpMongo, getCollection, MONGO_MODULE } from "../../test-utils/mongo";
import { CollectionViewRepository } from "./collection-view-repository";
import { CollectionView } from "./collection-view";
import { Blockchains } from "@nft-marketplace/common";
import { CollectionLinksView } from "./collection-links-view";
import { instanceToPlain } from "class-transformer";
import { cloneDeep } from "lodash";

let repository: CollectionViewRepository;
let collection: Collection<any>;
let connection: Connection;

beforeEach(async () => {
    const testModule = await Test.createTestingModule({
        imports: [MONGO_MODULE],
        providers: [CollectionViewRepository]
    }).compile();

    repository = testModule.get(CollectionViewRepository);
    connection = testModule.get(Connection);
    collection = getCollection("collection-views", connection);
    await collection.deleteMany({});
});

afterEach(async () => {
    await cleanUpMongo(connection);
});

test("save - persists collection view", async () => {
    const view = new CollectionView();
    view._id = new ObjectId();
    view.categoryId = "cat-id";
    view.name = "the-collection";
    view.blockchain = Blockchains.ETHEREUM;
    view.customUrl = "some-url";
    view.salePercentage = 45;
    view.description = "a description";
    view.imageUrl = "collection-image";
    view.isExplicit = false;
    view.paymentToken = "ETH";
    view.links = new CollectionLinksView();
    view.links.medium = "med";
    view.links.discord = "dis";
    view.links.instagram = "ins";
    view.links.telegram = "tel";
    view.links.website = "web";

    const saved = await repository.save(view);
    expect(saved).toEqual(view);

    const found = await collection.find({ _id: view._id }).toArray();
    expect(found.length).toBe(1);
    expect(found[0]).toEqual(view);
    expect(found[0].createdAt).toBeInstanceOf(Date);
});

test("countByName - returns 0 for no match", async () => {
    const view = new CollectionView();
    view._id = new ObjectId();
    view.categoryId = "cat-id";
    view.name = "the-collection";
    view.blockchain = Blockchains.ETHEREUM;
    view.customUrl = "some-url";
    view.salePercentage = 45;
    view.description = "a description";
    view.imageUrl = "collection-image";
    view.isExplicit = false;
    view.paymentToken = "ETH";
    view.links = new CollectionLinksView();
    view.links.medium = "med";
    view.links.discord = "dis";
    view.links.instagram = "ins";
    view.links.telegram = "tel";
    view.links.website = "web";

    await collection.insertOne(instanceToPlain(view));

    const count = await repository.countByName("blarg");
    expect(count).toEqual(0);
});

test("countByName - returns 1 for match", async () => {
    const view1 = new CollectionView();
    view1._id = new ObjectId();
    view1.categoryId = "cat-id";
    view1.name = "the-collection";
    view1.blockchain = Blockchains.ETHEREUM;
    view1.customUrl = "some-url";
    view1.salePercentage = 45;
    view1.description = "a description";
    view1.imageUrl = "collection-image";
    view1.isExplicit = false;
    view1.paymentToken = "ETH";
    view1.links = new CollectionLinksView();
    view1.links.medium = "med";
    view1.links.discord = "dis";
    view1.links.instagram = "ins";
    view1.links.telegram = "tel";
    view1.links.website = "web";

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
    view.blockchain = Blockchains.ETHEREUM;
    view.customUrl = "some-url";
    view.salePercentage = 45;
    view.description = "a description";
    view.imageUrl = "collection-image";
    view.isExplicit = false;
    view.paymentToken = "ETH";
    view.links = new CollectionLinksView();
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
    view1.blockchain = Blockchains.ETHEREUM;
    view1.customUrl = "some-url";
    view1.salePercentage = 45;
    view1.description = "a description";
    view1.imageUrl = "collection-image";
    view1.isExplicit = false;
    view1.paymentToken = "ETH";
    view1.links = new CollectionLinksView();
    view1.links.medium = "med";
    view1.links.discord = "dis";
    view1.links.instagram = "ins";
    view1.links.telegram = "tel";
    view1.links.website = "web";

    const view2 = cloneDeep(view1);
    view2._id = new ObjectId();
    view2.customUrl = "other-url";

    await collection.insertOne(instanceToPlain(view1));
    await collection.insertOne(instanceToPlain(view2));

    const count = await repository.countByCustomUrl("some-url");
    expect(count).toEqual(1);
});