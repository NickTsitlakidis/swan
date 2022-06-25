import { Collection, ObjectId } from "mongodb";
import { TestingModule } from "@nestjs/testing";
import { UserViewRepository } from "./user-view-repository";
import { instanceToPlain } from "class-transformer";
import { UserView } from "./user-view";
import { cleanUpMongo, getCollection, getMongoTestingModule } from "../../test-utils/test-modules";

let repository: UserViewRepository;
let collection: Collection<any>;
let moduleRef: TestingModule;

beforeEach(async () => {
    moduleRef = await getMongoTestingModule(UserView, UserViewRepository);

    repository = moduleRef.get(UserViewRepository);
    collection = getCollection("user-views", moduleRef);
    await collection.deleteMany({});
});

afterEach(async () => {
    await cleanUpMongo(moduleRef);
});

test("findById - returns match", async () => {
    const view = new UserView();
    view._id = new ObjectId();

    await collection.insertOne(instanceToPlain(view));

    const found = await repository.findById(view.id);
    expect(found).toMatchObject(view);
});

test("findById - returns undefined for no match", async () => {
    const view = new UserView();
    view._id = new ObjectId();

    await collection.insertOne(instanceToPlain(view));

    const found = await repository.findById(new ObjectId().toHexString());
    expect(found).toBeNull();
});

test("save - persists view", async () => {
    const view = new UserView();
    view._id = new ObjectId();

    const saved = await repository.save(view);
    expect(saved).toEqual(view);

    const found = await collection.find({ _id: view._id }).toArray();
    expect(found.length).toBe(1);
    expect(found[0]).toMatchObject(view);
});
