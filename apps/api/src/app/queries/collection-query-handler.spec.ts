import { CollectionViewRepository } from "../views/collection/collection-view-repository";
import { CollectionQueryHandler } from "./collection-query-handler";
import { getUnitTestingModule } from "../test-utils/test-modules";
import { CollectionView } from "../views/collection/collection-view";
import { ObjectID } from "mongodb";

let repoMock: CollectionViewRepository;
let handler: CollectionQueryHandler;

beforeEach(async () => {
    const testModule = await getUnitTestingModule(CollectionQueryHandler);

    handler = testModule.get(CollectionQueryHandler);
    repoMock = testModule.get(CollectionViewRepository);
});

test("getNameAvailability - returns true when name is not found", async () => {
    const countSpy = jest.spyOn(repoMock, "countByName").mockResolvedValue(0);

    const result = await handler.getNameAvailability("monkeys");
    expect(result.isAvailable).toBe(true);

    expect(countSpy).toHaveBeenCalledWith("monkeys");
    expect(countSpy).toHaveBeenCalledTimes(1);
});

test("getNameAvailability - returns false when name is found", async () => {
    const countSpy = jest.spyOn(repoMock, "countByName").mockResolvedValue(1);

    const result = await handler.getNameAvailability("monkeys");
    expect(result.isAvailable).toBe(false);

    expect(countSpy).toHaveBeenCalledWith("monkeys");
    expect(countSpy).toHaveBeenCalledTimes(1);
});

test("getUrlAvailability - returns true when url is not found", async () => {
    const countSpy = jest.spyOn(repoMock, "countByCustomUrl").mockResolvedValue(0);

    const result = await handler.getUrlAvailability("monkeys");
    expect(result.isAvailable).toBe(true);

    expect(countSpy).toHaveBeenCalledWith("monkeys");
    expect(countSpy).toHaveBeenCalledTimes(1);
});

test("getUrlAvailability - returns false when url is found", async () => {
    const countSpy = jest.spyOn(repoMock, "countByCustomUrl").mockResolvedValue(1);

    const result = await handler.getUrlAvailability("monkeys");
    expect(result.isAvailable).toBe(false);

    expect(countSpy).toHaveBeenCalledWith("monkeys");
    expect(countSpy).toHaveBeenCalledTimes(1);
});

test("getCollectionByUserId - returns empty array when no collections are found", async () => {
    const countSpy = jest.spyOn(repoMock, "findByUserId").mockResolvedValue([]);

    const result = await handler.getCollectionByUserId("user");
    expect(result.length).toBe(0);

    expect(countSpy).toHaveBeenCalledTimes(1);

    expect(countSpy).toHaveBeenCalledWith("user");
});

test("getCollectionByUserId - returns false when collections is not found", async () => {
    const collectionViews = [new CollectionView(), new CollectionView()];
    collectionViews[0].id = new ObjectID().toHexString();
    collectionViews[0].blockchainId = "block1";
    collectionViews[0].categoryId = "cat1";
    collectionViews[0].name = "collection1";
    collectionViews[0].userId = "user";
    collectionViews[1].id = new ObjectID().toHexString();
    collectionViews[1].userId = "user";
    collectionViews[1].blockchainId = "block2";
    collectionViews[1].categoryId = "cat2";
    collectionViews[1].name = "collection2";

    const countSpy = jest.spyOn(repoMock, "findByUserId").mockResolvedValue(collectionViews);

    const result = await handler.getCollectionByUserId("user");
    expect(result.length).toBe(2);

    expect(result[0].blockchainId).toBe("block1");
    expect(result[0].categoryId).toBe("cat1");
    expect(result[0].name).toBe("collection1");
    expect(result[0].id).toBe(collectionViews[0].id);

    expect(result[1].blockchainId).toBe("block2");
    expect(result[1].categoryId).toBe("cat2");
    expect(result[1].name).toBe("collection2");
    expect(result[1].id).toBe(collectionViews[1].id);

    expect(countSpy).toHaveBeenCalledTimes(1);

    expect(countSpy).toHaveBeenCalledWith("user");
});
