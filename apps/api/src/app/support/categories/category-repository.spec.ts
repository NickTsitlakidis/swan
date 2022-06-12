import { Collection, ObjectId } from "mongodb";
import { instanceToPlain } from "class-transformer";
import { cleanUpMongo, getCollection, getMongoModule } from "../../test-utils/mongo";
import { CategoryRepository } from "./category-repository";
import { Category } from "./category";
import { TestingModule } from "@nestjs/testing";

let repository: CategoryRepository;
let collection: Collection<any>;
let testingModule: TestingModule;

beforeEach(async () => {
    testingModule = await getMongoModule(Category, CategoryRepository);

    repository = testingModule.get(CategoryRepository);
    collection = getCollection("categories", testingModule);
    await collection.deleteMany({});

});

afterEach(async () => {
    await cleanUpMongo(testingModule);
});

test("findAll - returns all when they exist", async () => {
    const cat1 = new Category();
    cat1.name = "cat1";
    cat1.imageUrl = "url1";
    cat1._id = new ObjectId();

    const cat2 = new Category();
    cat2.name = "cat2";
    cat2.imageUrl = "url2";
    cat2._id = new ObjectId();

    await collection.insertOne(instanceToPlain(cat1));
    await collection.insertOne(instanceToPlain(cat2));

    const found = await repository.findAll();
    expect(found).toMatchObject([cat1, cat2]);
});

test("findAll - returns empty array for empty collection", async () => {
    const found = await repository.findAll();
    expect(found).toEqual([]);
});
