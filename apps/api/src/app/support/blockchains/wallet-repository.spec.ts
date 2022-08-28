import { cleanUpMongo, getCollection, getMongoTestingModule } from "../../test-utils/test-modules";
import { Collection, ObjectId } from "mongodb";
import { TestingModule } from "@nestjs/testing";
import { WalletRepository } from "./wallet-repository";
import { Wallet } from "./wallet";
import { instanceToPlain } from "class-transformer";

let repository: WalletRepository;
let collection: Collection<any>;
let moduleRef: TestingModule;

beforeEach(async () => {
    moduleRef = await getMongoTestingModule(Wallet, WalletRepository);

    repository = moduleRef.get(WalletRepository);
    collection = getCollection("wallets", moduleRef);
    await collection.deleteMany({});
});

afterEach(async () => {
    await cleanUpMongo(moduleRef);
});

test("findAll - returns empty array for empty collection", async () => {
    const wallets = await repository.findAll();
    expect(wallets.length).toBe(0);
});

test("findAll - returns all Wallet documents of collection", async () => {
    const w1 = new Wallet();
    w1._id = new ObjectId();

    const w2 = new Wallet();
    w2._id = new ObjectId();

    const w3 = new Wallet();
    w3._id = new ObjectId();

    await collection.insertOne(instanceToPlain(w1));
    await collection.insertOne(instanceToPlain(w2));
    await collection.insertOne(instanceToPlain(w3));

    const wallets = await repository.findAll();
    expect(wallets.length).toBe(3);
    expect(wallets[0]).toMatchObject(w1);
    expect(wallets[1]).toMatchObject(w2);
    expect(wallets[2]).toMatchObject(w3);
});

test("findById - returns matching wallet", async () => {
    const w1 = new Wallet();
    w1._id = new ObjectId();

    const w2 = new Wallet();
    w2._id = new ObjectId();

    const w3 = new Wallet();
    w3._id = new ObjectId();

    await collection.insertOne(instanceToPlain(w1));
    await collection.insertOne(instanceToPlain(w2));
    await collection.insertOne(instanceToPlain(w3));

    const wallet = await repository.findById(w2.id);
    expect(wallet).toMatchObject(w2);
});

test("findById - returns null for no matching wallet", async () => {
    const w1 = new Wallet();
    w1._id = new ObjectId();

    const w2 = new Wallet();
    w2._id = new ObjectId();

    const w3 = new Wallet();
    w3._id = new ObjectId();

    await collection.insertOne(instanceToPlain(w1));
    await collection.insertOne(instanceToPlain(w2));
    await collection.insertOne(instanceToPlain(w3));

    const wallet = await repository.findById(new ObjectId().toHexString());
    expect(wallet).toBeNull();
});
