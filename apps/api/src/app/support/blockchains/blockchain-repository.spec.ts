import { EnvBlockChainType } from "@swan/dto";
import { Collection, ObjectId } from "mongodb";
import { TestingModule } from "@nestjs/testing";
import { cleanUpMongo, getCollection, getMongoTestingModule } from "../../test-utils/test-modules";
import { BlockchainRepository } from "./blockchain-repository";
import { Blockchain } from "./blockchain";
import { instanceToPlain } from "class-transformer";
import { buildBlockchain } from "../../test-utils/test-builders";
import { ConfigService } from "@nestjs/config";

let repository: BlockchainRepository;
let collection: Collection<any>;
let moduleRef: TestingModule;
let configService: ConfigService;

beforeEach(async () => {
    moduleRef = await getMongoTestingModule(Blockchain, BlockchainRepository);

    repository = moduleRef.get(BlockchainRepository);
    configService = moduleRef.get(ConfigService);
    collection = getCollection("blockchains", moduleRef);
    await collection.deleteMany({});
});

afterEach(async () => {
    await cleanUpMongo(moduleRef);
});

test("findByIds - returns multiple blockchain matches", async () => {
    const configSpy = jest.spyOn(configService, "get").mockReturnValue(EnvBlockChainType.ALL);

    const view1 = buildBlockchain();
    const view2 = buildBlockchain();
    const view3 = buildBlockchain();

    await collection.insertOne(instanceToPlain(view1));
    await collection.insertOne(instanceToPlain(view2));
    await collection.insertOne(instanceToPlain(view3));

    const found = await repository.findByIds([view2.id, view3.id]);
    expect(configSpy).toBeCalledTimes(1);
    expect(found.length).toBe(2);
    expect(found[0]).toMatchObject(view2);
    expect(found[1]).toMatchObject(view3);
});

test("findByIds - returns empty array for no blockchain matches", async () => {
    const configSpy = jest.spyOn(configService, "get").mockReturnValue(EnvBlockChainType.ALL);

    const view1 = buildBlockchain();
    const view2 = buildBlockchain();
    const view3 = buildBlockchain();

    await collection.insertOne(instanceToPlain(view1));
    await collection.insertOne(instanceToPlain(view2));
    await collection.insertOne(instanceToPlain(view3));

    const found = await repository.findByIds([new ObjectId().toHexString(), new ObjectId().toHexString()]);
    expect(configSpy).toBeCalledTimes(1);
    expect(found.length).toBe(0);
});

test("findAll - returns empty array for empty collection", async () => {
    const configSpy = jest.spyOn(configService, "get").mockReturnValue(EnvBlockChainType.ALL);

    const found = await repository.findAll();
    expect(configSpy).toBeCalledTimes(1);
    expect(found.length).toBe(0);
});

test("findAll - returns all blockchains", async () => {
    const configSpy = jest.spyOn(configService, "get").mockReturnValue(EnvBlockChainType.ALL);
    const view1 = buildBlockchain();
    const view2 = buildBlockchain();
    const view3 = buildBlockchain();

    await collection.insertOne(instanceToPlain(view1));
    await collection.insertOne(instanceToPlain(view2));
    await collection.insertOne(instanceToPlain(view3));

    const found = await repository.findAll();
    expect(configSpy).toBeCalledTimes(1);
    expect(found.length).toBe(3);
    expect(found[0]).toMatchObject(view1);
    expect(found[1]).toMatchObject(view2);
    expect(found[2]).toMatchObject(view3);
});

test("findById - returns null for no blockchain match", async () => {
    const configSpy = jest.spyOn(configService, "get").mockReturnValue(EnvBlockChainType.ALL);
    const view1 = buildBlockchain();
    const view2 = buildBlockchain();

    await collection.insertOne(instanceToPlain(view1));
    await collection.insertOne(instanceToPlain(view2));

    const found = await repository.findById(new ObjectId().toHexString());
    expect(configSpy).toBeCalledTimes(1);
    expect(found).toBeNull();
});

test("findById - returns match for blockchain match", async () => {
    const configSpy = jest.spyOn(configService, "get").mockReturnValue(EnvBlockChainType.ALL);
    const view1 = buildBlockchain();
    const view2 = buildBlockchain();

    await collection.insertOne(instanceToPlain(view1));
    await collection.insertOne(instanceToPlain(view2));

    const found = await repository.findById(view2.id);
    expect(configSpy).toBeCalledTimes(1);
    expect(found).toMatchObject(view2);
});

test("findAll - returns all enabled blockchains", async () => {
    const configSpy = jest.spyOn(configService, "get").mockReturnValue(EnvBlockChainType.ALL);
    const view1 = buildBlockchain();
    const view2 = buildBlockchain();
    const view3 = buildBlockchain();

    view1.enabled = false;

    await collection.insertOne(instanceToPlain(view1));
    await collection.insertOne(instanceToPlain(view2));
    await collection.insertOne(instanceToPlain(view3));

    const found = await repository.findAll();
    expect(configSpy).toBeCalledTimes(1);
    expect(found.length).toBe(2);
    expect(found[0]).toMatchObject(view2);
    expect(found[1]).toMatchObject(view3);
});

test("findById - returns no match for non enabled blockchain", async () => {
    const configSpy = jest.spyOn(configService, "get").mockReturnValue(EnvBlockChainType.ALL);
    const view1 = buildBlockchain();
    const view2 = buildBlockchain();

    view2.enabled = false;

    await collection.insertOne(instanceToPlain(view1));
    await collection.insertOne(instanceToPlain(view2));

    const found = await repository.findById(view2.id);
    expect(configSpy).toBeCalledTimes(1);
    expect(found).toBeNull();
});

test("findByIds - returns multiple enabled blockchain matches", async () => {
    const configSpy = jest.spyOn(configService, "get").mockReturnValue(EnvBlockChainType.ALL);
    const view1 = buildBlockchain();
    const view2 = buildBlockchain();
    const view3 = buildBlockchain();

    view2.enabled = false;

    await collection.insertOne(instanceToPlain(view1));
    await collection.insertOne(instanceToPlain(view2));
    await collection.insertOne(instanceToPlain(view3));

    const found = await repository.findByIds([view2.id, view3.id]);
    expect(configSpy).toBeCalledTimes(1);
    expect(found.length).toBe(1);
    expect(found[0]).toMatchObject(view3);
});

test("findByIds - returns multiple mainnet blockchain matches", async () => {
    const configSpy = jest.spyOn(configService, "get").mockReturnValue(EnvBlockChainType.MAIN);
    const view1 = buildBlockchain();
    const view2 = buildBlockchain();
    const view3 = buildBlockchain();

    view2.isTestNetwork = true;

    await collection.insertOne(instanceToPlain(view1));
    await collection.insertOne(instanceToPlain(view2));
    await collection.insertOne(instanceToPlain(view3));

    const found = await repository.findByIds([view1.id, view2.id, view3.id]);
    expect(configSpy).toBeCalledTimes(1);
    expect(found.length).toBe(2);
    expect(found[0]).toMatchObject(view1);
    expect(found[1]).toMatchObject(view3);
});

test("findAll - returns all mainnet blockchains", async () => {
    const configSpy = jest.spyOn(configService, "get").mockReturnValue(EnvBlockChainType.MAIN);
    const view1 = buildBlockchain();
    const view2 = buildBlockchain();
    const view3 = buildBlockchain();

    view2.isTestNetwork = true;

    await collection.insertOne(instanceToPlain(view1));
    await collection.insertOne(instanceToPlain(view2));
    await collection.insertOne(instanceToPlain(view3));

    const found = await repository.findAll();
    expect(configSpy).toBeCalledTimes(1);
    expect(found.length).toBe(2);
    expect(found[0]).toMatchObject(view1);
    expect(found[1]).toMatchObject(view3);
});

test("findById - returns no match for non mainnet blockchain", async () => {
    const configSpy = jest.spyOn(configService, "get").mockReturnValue(EnvBlockChainType.MAIN);
    const view1 = buildBlockchain();
    const view2 = buildBlockchain();

    view2.isTestNetwork = true;

    await collection.insertOne(instanceToPlain(view1));
    await collection.insertOne(instanceToPlain(view2));

    const found = await repository.findById(view2.id);
    expect(configSpy).toBeCalledTimes(1);
    expect(found).toBeNull();
});

test("findById - returns match for mainnet blockchain", async () => {
    const configSpy = jest.spyOn(configService, "get").mockReturnValue(EnvBlockChainType.MAIN);
    const view1 = buildBlockchain();
    const view2 = buildBlockchain();

    await collection.insertOne(instanceToPlain(view1));
    await collection.insertOne(instanceToPlain(view2));

    const found = await repository.findById(view2.id);
    expect(configSpy).toBeCalledTimes(1);
    expect(found).toMatchObject(view2);
});

test("findByIds - returns multiple testnet blockchain matches", async () => {
    const configSpy = jest.spyOn(configService, "get").mockReturnValue(EnvBlockChainType.TEST);
    const view1 = buildBlockchain();
    const view2 = buildBlockchain();
    const view3 = buildBlockchain();

    view2.isTestNetwork = true;
    view3.isTestNetwork = true;

    await collection.insertOne(instanceToPlain(view1));
    await collection.insertOne(instanceToPlain(view2));
    await collection.insertOne(instanceToPlain(view3));

    const found = await repository.findByIds([view1.id, view2.id, view3.id]);
    expect(configSpy).toBeCalledTimes(1);
    expect(found.length).toBe(2);
    expect(found[0]).toMatchObject(view2);
    expect(found[1]).toMatchObject(view3);
});

test("findAll - returns all testnet blockchains", async () => {
    const configSpy = jest.spyOn(configService, "get").mockReturnValue(EnvBlockChainType.TEST);
    const view1 = buildBlockchain();
    const view2 = buildBlockchain();
    const view3 = buildBlockchain();

    view2.isTestNetwork = true;
    view3.isTestNetwork = true;

    await collection.insertOne(instanceToPlain(view1));
    await collection.insertOne(instanceToPlain(view2));
    await collection.insertOne(instanceToPlain(view3));

    const found = await repository.findAll();
    expect(configSpy).toBeCalledTimes(1);
    expect(found.length).toBe(2);
    expect(found[0]).toMatchObject(view2);
    expect(found[1]).toMatchObject(view3);
});

test("findById - returns no match for non testnet blockchain", async () => {
    const configSpy = jest.spyOn(configService, "get").mockReturnValue(EnvBlockChainType.TEST);
    const view1 = buildBlockchain();
    const view2 = buildBlockchain();

    view2.isTestNetwork = false;

    await collection.insertOne(instanceToPlain(view1));
    await collection.insertOne(instanceToPlain(view2));

    const found = await repository.findById(view2.id);
    expect(configSpy).toBeCalledTimes(1);
    expect(found).toBeNull();
});

test("findById - returns match for testnet blockchain", async () => {
    const configSpy = jest.spyOn(configService, "get").mockReturnValue(EnvBlockChainType.TEST);
    const view1 = buildBlockchain();
    const view2 = buildBlockchain();

    view2.isTestNetwork = true;

    await collection.insertOne(instanceToPlain(view1));
    await collection.insertOne(instanceToPlain(view2));

    const found = await repository.findById(view2.id);
    expect(configSpy).toBeCalledTimes(1);
    expect(found).toMatchObject(view2);
});
