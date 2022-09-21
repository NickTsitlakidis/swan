import { Collection } from "mongodb";
import { TestingModule } from "@nestjs/testing";
import { cleanUpMongo, getCollection, getMongoTestingModule } from "../../test-utils/test-modules";
import { NftViewRepository } from "./nft-view-repository";
import { NftView } from "./nft-view";
import { buildNftView } from "../../test-utils/test-builders";
import { instanceToPlain } from "class-transformer";

let repository: NftViewRepository;
let collection: Collection<any>;
let moduleRef: TestingModule;

beforeEach(async () => {
    moduleRef = await getMongoTestingModule(NftView, NftViewRepository);

    repository = moduleRef.get(NftViewRepository);
    collection = getCollection("nft-views", moduleRef);
    await collection.deleteMany({});
});

afterEach(async () => {
    await cleanUpMongo(moduleRef);
});

test("findByUserId - returns empty array for no match", async () => {
    const view1 = buildNftView();
    const view2 = buildNftView();

    await collection.insertMany([instanceToPlain(view1), instanceToPlain(view2)]);

    const result = await repository.findByUserId("a-user");
    expect(result.length).toBe(0);
});

test("findByUserId - returns single matched nft", async () => {
    const view1 = buildNftView();
    const view2 = buildNftView();

    await collection.insertMany([instanceToPlain(view1), instanceToPlain(view2)]);

    const result = await repository.findByUserId(view2.userId);
    expect(result.length).toBe(1);
    expect(result[0]).toMatchObject(view2);
});

test("findByUserId - returns multiple matched nft", async () => {
    const view1 = buildNftView();
    const view2 = buildNftView();
    const view3 = buildNftView();
    view3.userId = view1.userId;

    await collection.insertMany([instanceToPlain(view1), instanceToPlain(view2), instanceToPlain(view3)]);

    const result = await repository.findByUserId(view1.userId);
    expect(result.length).toBe(2);
    expect(result[0]).toMatchObject(view1);
    expect(result[1]).toMatchObject(view3);
});
