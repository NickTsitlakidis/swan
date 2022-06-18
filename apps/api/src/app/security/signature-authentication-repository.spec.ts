import { Collection, ObjectId } from "mongodb";
import { TestingModule } from "@nestjs/testing";
import { cleanUpMongo, getCollection, getMongoTestingModule } from "../test-utils/test-modules";
import { SignatureAuthenticationRepository } from "./signature-authentication-repository";
import { SignatureAuthentication } from "./signature-authentication";
import { instanceToPlain } from "class-transformer";

let repository: SignatureAuthenticationRepository;
let collection: Collection<any>;
let moduleRef: TestingModule;

beforeEach(async () => {
    moduleRef = await getMongoTestingModule(SignatureAuthentication, SignatureAuthenticationRepository);

    repository = moduleRef.get(SignatureAuthenticationRepository);
    collection = getCollection("signature-authentications", moduleRef);
    await collection.deleteMany({});
});

afterEach(async () => {
    await cleanUpMongo(moduleRef);
});

test("save - persists authentication", async () => {
    const view = new SignatureAuthentication();
    view._id = new ObjectId();
    view.message = "123";
    view.address = "addr";
    view.walletId = "w-id";
    view.blockchainId = "b-id";

    const saved = await repository.save(view);
    expect(saved).toEqual(view);

    const found = await collection.find({ _id: view._id }).toArray();
    expect(found.length).toBe(1);
    expect(found[0]).toMatchObject(view);
});

test("findByAddressAndChain - returns authentication match", async () => {
    const view = new SignatureAuthentication();
    view._id = new ObjectId();
    view.message = "123";
    view.address = "addr";
    view.walletId = "w-id";
    view.blockchainId = "b-id";

    await collection.insertOne(instanceToPlain(view));

    const found = await repository.findByAddressAndChain(view.address, "b-id");
    expect(found).toMatchObject(view);
});

test("findByAddress - returns null for no address match", async () => {
    const view = new SignatureAuthentication();
    view._id = new ObjectId();
    view.message = "123";
    view.address = "addr";
    view.walletId = "w-id";
    view.blockchainId = "b-id";

    await collection.insertOne(instanceToPlain(view));

    const found = await repository.findByAddressAndChain("nooooop", "b-id");
    expect(found).toBeNull();
});

test("findByAddress - returns null for no chain match", async () => {
    const view = new SignatureAuthentication();
    view._id = new ObjectId();
    view.message = "123";
    view.address = "addr";
    view.walletId = "w-id";
    view.blockchainId = "b-id";

    await collection.insertOne(instanceToPlain(view));

    const found = await repository.findByAddressAndChain("addr", "other");
    expect(found).toBeNull();
});

test("deleteById - deletes authentication match", async () => {
    const view1 = new SignatureAuthentication();
    view1._id = new ObjectId();
    view1.message = "123";
    view1.address = "addr";
    view1.walletId = "w-id1";
    view1.blockchainId = "b-id1";

    const view2 = new SignatureAuthentication();
    view2._id = new ObjectId();
    view2.message = "456";
    view2.address = "addr";
    view2.walletId = "w-id2";
    view2.blockchainId = "b-id2";

    const view3 = new SignatureAuthentication();
    view3._id = new ObjectId();
    view3.message = "123";
    view3.address = "other";
    view3.walletId = "w-id3";
    view3.blockchainId = "b-id3";

    await collection.insertOne(instanceToPlain(view1));
    await collection.insertOne(instanceToPlain(view2));
    await collection.insertOne(instanceToPlain(view3));

    await repository.deleteById(view2.id);

    const inCollection = await collection.find().toArray();
    expect(inCollection.length).toBe(2);
    expect(inCollection.find((v) => v._id.toHexString() === view1._id.toHexString())).toBeDefined();
    expect(inCollection.find((v) => v._id.toHexString() === view3._id.toHexString())).toBeDefined();
});

test("deleteByAddressAndChain - deletes authentication match", async () => {
    const view1 = new SignatureAuthentication();
    view1._id = new ObjectId();
    view1.message = "123";
    view1.address = "addr1";
    view1.walletId = "w-id1";
    view1.blockchainId = "b-id1";

    const view2 = new SignatureAuthentication();
    view2._id = new ObjectId();
    view2.message = "456";
    view2.address = "addr2";
    view2.walletId = "w-id2";
    view2.blockchainId = "b-id2";

    const view3 = new SignatureAuthentication();
    view3._id = new ObjectId();
    view3.message = "123";
    view3.address = "other";
    view3.walletId = "w-id3";
    view3.blockchainId = "b-id3";

    await collection.insertOne(instanceToPlain(view1));
    await collection.insertOne(instanceToPlain(view2));
    await collection.insertOne(instanceToPlain(view3));

    await repository.deleteByAddressAndChain("addr2", "b-id2");

    const inCollection = await collection.find().toArray();
    expect(inCollection.length).toBe(2);
    expect(inCollection.find((v) => v._id.toHexString() === view1._id.toHexString())).toBeDefined();
    expect(inCollection.find((v) => v._id.toHexString() === view3._id.toHexString())).toBeDefined();
});
