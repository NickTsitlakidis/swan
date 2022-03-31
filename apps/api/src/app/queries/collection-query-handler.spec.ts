import { getThrower } from "../test-utils/mocking";
import { Test } from "@nestjs/testing";
import { CollectionViewRepository } from "../views/collection/collection-view-repository";
import { CollectionQueryHandler } from "./collection-query-handler";

const repoMock: Partial<CollectionViewRepository> = {
    countByName: getThrower(),
    countByCustomUrl: getThrower()
};

let handler: CollectionQueryHandler;

beforeEach(async () => {
    const testModule = await Test.createTestingModule({
        providers: [
            CollectionQueryHandler,
            {
                provide: CollectionViewRepository,
                useValue: repoMock
            }
        ]
    }).compile();

    handler = testModule.get(CollectionQueryHandler);
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
