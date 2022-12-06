import { Collection, ObjectId } from "mongodb";
import { instanceToPlain } from "class-transformer";
import { cleanUpMongo, getCollection, getMongoTestingModule } from "../../test-utils/test-modules";
import { CategoryRepository } from "./category-repository";
import { Category } from "./category";
import { TestingModule } from "@nestjs/testing";

let repository: CategoryRepository;
let collection: Collection<any>;
let testingModule: TestingModule;

beforeEach(async () => {
    testingModule = await getMongoTestingModule(Category, CategoryRepository);

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

test("findById - returns match", async () => {
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

    const found = await repository.findById(cat2.id);
    expect(found).toMatchObject(cat2);
});

test("findById - returns null for no id match", async () => {
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

    const found = await repository.findById(new ObjectId().toHexString());
    expect(found).toBeNull();
});

test("countById - returns 1 for match", async () => {
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

    const count = await repository.countById(cat2.id);
    expect(count).toBe(1);
});

test("countById - returns 0 for no match", async () => {
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

    const count = await repository.countById(new ObjectId().toHexString());
    expect(count).toBe(0);
});
