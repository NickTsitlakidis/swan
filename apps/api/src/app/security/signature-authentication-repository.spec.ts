import { Collection, ObjectId } from "mongodb";
import { Connection } from "typeorm";
import { Test } from "@nestjs/testing";
import { cleanUpMongo, getCollection, MONGO_MODULE } from "../test-utils/mongo";
import { SignatureAuthenticationRepository } from "./signature-authentication-repository";
import { SignatureAuthentication } from "./signature-authentication";
import { instanceToPlain } from "class-transformer";
import { Blockchains, SupportedWallets } from "@nft-marketplace/common";

let repository: SignatureAuthenticationRepository;
let collection: Collection<any>;
let connection: Connection;

beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
        imports: [MONGO_MODULE],
        providers: [SignatureAuthenticationRepository]
    }).compile();

    repository = moduleRef.get(SignatureAuthenticationRepository);
    connection = moduleRef.get(Connection);
    collection = getCollection("signature-authentications", connection);
    await collection.deleteMany({});
});

afterEach(async () => {
    await cleanUpMongo(connection);
});

test("save - persists authentication", async () => {
    const view = new SignatureAuthentication();
    view._id = new ObjectId();
    view.message = "123";
    view.address = "addr";
    view.wallet = SupportedWallets.PHANTOM;
    view.blockchain = Blockchains.SOLANA;

    const saved = await repository.save(view);
    expect(saved).toEqual(view);

    const found = await collection.find({ _id: view._id }).toArray();
    expect(found.length).toBe(1);
    expect(found[0]).toEqual(view);
});

test("findByAddressAndChain - returns authentication match", async () => {
    const view = new SignatureAuthentication();
    view._id = new ObjectId();
    view.message = "123";
    view.address = "addr";
    view.wallet = SupportedWallets.PHANTOM;
    view.blockchain = Blockchains.SOLANA;

    await collection.insertOne(instanceToPlain(view));

    const found = await repository.findByAddressAndChain(view.address, Blockchains.SOLANA);
    expect(found).toEqual(view);
});

test("findByAddress - returns undefined for no address match", async () => {
    const view = new SignatureAuthentication();
    view._id = new ObjectId();
    view.message = "123";
    view.address = "addr";
    view.wallet = SupportedWallets.PHANTOM;
    view.blockchain = Blockchains.SOLANA;

    await collection.insertOne(instanceToPlain(view));

    const found = await repository.findByAddressAndChain("nooooop", Blockchains.SOLANA);
    expect(found).toBeUndefined();
});

test("findByAddress - returns undefined for no chain match", async () => {
    const view = new SignatureAuthentication();
    view._id = new ObjectId();
    view.message = "123";
    view.address = "addr";
    view.wallet = SupportedWallets.PHANTOM;
    view.blockchain = Blockchains.SOLANA;

    await collection.insertOne(instanceToPlain(view));

    const found = await repository.findByAddressAndChain("addr", Blockchains.ETHEREUM);
    expect(found).toBeUndefined();
});

test("deleteById - deletes authentication match", async () => {
    const view1 = new SignatureAuthentication();
    view1._id = new ObjectId();
    view1.message = "123";
    view1.address = "addr";
    view1.wallet = SupportedWallets.PHANTOM;
    view1.blockchain = Blockchains.SOLANA;

    const view2 = new SignatureAuthentication();
    view2._id = new ObjectId();
    view2.message = "456";
    view2.address = "addr";
    view2.wallet = SupportedWallets.PHANTOM;
    view2.blockchain = Blockchains.SOLANA;

    const view3 = new SignatureAuthentication();
    view3._id = new ObjectId();
    view3.message = "123";
    view3.address = "other";
    view3.wallet = SupportedWallets.PHANTOM;
    view3.blockchain = Blockchains.SOLANA;

    await collection.insertOne(instanceToPlain(view1));
    await collection.insertOne(instanceToPlain(view2));
    await collection.insertOne(instanceToPlain(view3));

    await repository.deleteById(view2.id);

    const inCollection = await collection.find().toArray();
    expect(inCollection.length).toBe(2);
    expect(inCollection.find((v) => v._id.toHexString() === view1.id)).toBeDefined();
    expect(inCollection.find((v) => v._id.toHexString() === view3.id)).toBeDefined();
});

test("deleteByAddressAndChain - deletes authentication match", async () => {
    const view1 = new SignatureAuthentication();
    view1._id = new ObjectId();
    view1.message = "123";
    view1.address = "addr1";
    view1.wallet = SupportedWallets.PHANTOM;
    view1.blockchain = Blockchains.SOLANA;

    const view2 = new SignatureAuthentication();
    view2._id = new ObjectId();
    view2.message = "456";
    view2.address = "addr2";
    view2.wallet = SupportedWallets.PHANTOM;
    view2.blockchain = Blockchains.SOLANA;

    const view3 = new SignatureAuthentication();
    view3._id = new ObjectId();
    view3.message = "123";
    view3.address = "addr2";
    view3.wallet = SupportedWallets.METAMASK;
    view3.blockchain = Blockchains.ETHEREUM;

    await collection.insertOne(instanceToPlain(view1));
    await collection.insertOne(instanceToPlain(view2));
    await collection.insertOne(instanceToPlain(view3));

    await repository.deleteByAddressAndChain("addr2", Blockchains.SOLANA);

    const inCollection = await collection.find().toArray();
    expect(inCollection.length).toBe(2);
    expect(inCollection.find((v) => v._id.toHexString() === view1.id)).toBeDefined();
    expect(inCollection.find((v) => v._id.toHexString() === view3.id)).toBeDefined();
});