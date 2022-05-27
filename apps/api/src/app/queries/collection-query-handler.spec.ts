import { CollectionViewRepository } from "../views/collection/collection-view-repository";
import { CollectionQueryHandler } from "./collection-query-handler";
import { getUnitTestingModule } from "../test-utils/test-modules";

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
