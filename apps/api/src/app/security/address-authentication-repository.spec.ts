import { Collection, ObjectId } from "mongodb";
import { Connection } from "typeorm";
import { Test } from "@nestjs/testing";
import { cleanUpMongo, getCollection, MONGO_MODULE } from "../test-utils/mongo";
import { AddressAuthenticationRepository } from "./address-authentication-repository";
import { AddressAuthentication } from "./address-authentication";
import { instanceToPlain } from "class-transformer";

let repository: AddressAuthenticationRepository;
let collection: Collection<any>;
let connection: Connection;

beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
        imports: [MONGO_MODULE],
        providers: [AddressAuthenticationRepository]
    }).compile();

    repository = moduleRef.get(AddressAuthenticationRepository);
    connection = moduleRef.get(Connection);
    collection = getCollection("address-authentications", connection);
    await collection.deleteMany({});
});

afterEach(async () => {
    await cleanUpMongo(connection);
});

test("save - persists authentication", async () => {
    const view = new AddressAuthentication();
    view._id = new ObjectId();
    view.nonce = "123";
    view.address = "addr";

    const saved = await repository.save(view);
    expect(saved).toEqual(view);

    const found = await collection.find({ _id: view._id }).toArray();
    expect(found.length).toBe(1);
    expect(found[0]).toEqual(view);
});

test("findByAddress - returns authentication match", async () => {
    const view = new AddressAuthentication();
    view._id = new ObjectId();
    view.nonce = "123";
    view.address = "addr";

    await collection.insertOne(instanceToPlain(view));

    const found = await repository.findByAddress(view.address);
    expect(found).toEqual([view]);
});

test("findByAddress - returns multiple authentication matches", async () => {
    const view1 = new AddressAuthentication();
    view1._id = new ObjectId();
    view1.nonce = "123";
    view1.address = "addr";

    const view2 = new AddressAuthentication();
    view2._id = new ObjectId();
    view2.nonce = "456";
    view2.address = "addr";

    const view3 = new AddressAuthentication();
    view3._id = new ObjectId();
    view3.nonce = "123";
    view3.address = "other";

    await collection.insertOne(instanceToPlain(view1));
    await collection.insertOne(instanceToPlain(view2));
    await collection.insertOne(instanceToPlain(view3));

    const found = await repository.findByAddress("addr");
    expect(found.find((v) => v.id === view1.id)).toBeDefined();
    expect(found.find((v) => v.id === view2.id)).toBeDefined();
    expect(found.length).toBe(2);
});

test("findByAddress - returns empty array for no match", async () => {
    const view = new AddressAuthentication();
    view._id = new ObjectId();
    view.nonce = "123";
    view.address = "addr";

    await collection.insertOne(instanceToPlain(view));

    const found = await repository.findByAddress("nooooop");
    expect(found.length).toEqual(0);
});

test("deleteById - deletes authentication match", async () => {
    const view1 = new AddressAuthentication();
    view1._id = new ObjectId();
    view1.nonce = "123";
    view1.address = "addr";

    const view2 = new AddressAuthentication();
    view2._id = new ObjectId();
    view2.nonce = "456";
    view2.address = "addr";

    const view3 = new AddressAuthentication();
    view3._id = new ObjectId();
    view3.nonce = "123";
    view3.address = "other";

    await collection.insertOne(instanceToPlain(view1));
    await collection.insertOne(instanceToPlain(view2));
    await collection.insertOne(instanceToPlain(view3));

    await repository.deleteById(view2.id);

    const inCollection = await collection.find().toArray();
    expect(inCollection.length).toBe(2);
    expect(inCollection.find((v) => v._id.toHexString() === view1.id)).toBeDefined();
    expect(inCollection.find((v) => v._id.toHexString() === view3.id)).toBeDefined();
});
