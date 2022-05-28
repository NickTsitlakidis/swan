import { Collection, ObjectId } from "mongodb";
import { Connection } from "typeorm";
import { Test } from "@nestjs/testing";
import { instanceToPlain } from "class-transformer";
import { cleanUpMongo, getCollection, MONGO_MODULE } from "../../test-utils/mongo";
import { CategoryRepository } from "./category-repository";
import { Category } from "./category";

let repository: CategoryRepository;
let collection: Collection<any>;
let connection: Connection;

beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
        imports: [MONGO_MODULE],
        providers: [CategoryRepository]
    }).compile();

    repository = moduleRef.get(CategoryRepository);
    connection = moduleRef.get(Connection);
    collection = getCollection("categories", connection);
    await collection.deleteMany({});
});

afterEach(async () => {
    await cleanUpMongo(connection);
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
    expect(found).toEqual([cat1, cat2]);
});

test("findAll - returns empty array for empty collection", async () => {
    const found = await repository.findAll();
    expect(found).toEqual([]);
});
