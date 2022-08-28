import { SupportQueryHandler } from "./support-query-handler";
import { CategoryRepository } from "../support/categories/category-repository";
import { Category } from "../support/categories/category";
import { ObjectId } from "mongodb";
import { CategoryDto } from "@swan/dto";
import { getUnitTestingModule } from "../test-utils/test-modules";

let categoryRepoMock: CategoryRepository;
let handler: SupportQueryHandler;

beforeEach(async () => {
    const testModule = await getUnitTestingModule(SupportQueryHandler);

    handler = testModule.get(SupportQueryHandler);
    categoryRepoMock = testModule.get(CategoryRepository);
});

test("getCategories - returns empty array if there are no views", async () => {
    const repoSpy = jest.spyOn(categoryRepoMock, "findAll").mockResolvedValue([]);

    const result = await handler.getCategories();

    expect(result.length).toBe(0);

    expect(repoSpy).toHaveBeenCalledTimes(1);
});

test("getCategories - returns mapped dto array", async () => {
    const views = [new Category(), new Category()];

    views[0]._id = new ObjectId();
    views[0].name = "one";
    views[0].imageUrl = "one-url";

    views[1]._id = new ObjectId();
    views[1].name = "two";
    views[1].imageUrl = "two-url";
    const repoSpy = jest.spyOn(categoryRepoMock, "findAll").mockResolvedValue(views);

    const result = await handler.getCategories();

    expect(result.length).toBe(2);
    expect(result[0]).toEqual(new CategoryDto(views[0].name, views[0].id, views[0].imageUrl));
    expect(result[1]).toEqual(new CategoryDto(views[1].name, views[1].id, views[1].imageUrl));

    expect(repoSpy).toHaveBeenCalledTimes(1);
});
