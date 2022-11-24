import { Collection } from "mongodb";
import { TestingModule } from "@nestjs/testing";
import { cleanUpMongo, getCollection, getMongoTestingModule } from "../../test-utils/test-modules";
import { EvmContractsRepository } from "./evm-contracts-repository";
import { EvmContract } from "./evm-contract";
import { buildEvmContract } from "../../test-utils/test-builders";
import { instanceToPlain } from "class-transformer";
import { EvmContractType } from "./evm-contract-type";

let repository: EvmContractsRepository;
let collection: Collection<any>;
let testingModule: TestingModule;

beforeEach(async () => {
    testingModule = await getMongoTestingModule(EvmContract, EvmContractsRepository);

    repository = testingModule.get(EvmContractsRepository);
    collection = getCollection("evm-contracts", testingModule);
    await collection.deleteMany({});
});

afterEach(async () => {
    await cleanUpMongo(testingModule);
});

test("findAll - returns all contract documents", async () => {
    const one = buildEvmContract();
    const two = buildEvmContract();

    await collection.insertMany([instanceToPlain(one), instanceToPlain(two)]);

    const found = await repository.findAll();
    expect(found.length).toBe(2);
    expect(found).toMatchObject([one, two]);
});

test("findAll - returns empty array when there are no documents", async () => {
    const found = await repository.findAll();
    expect(found.length).toBe(0);
});

test("findByType - returns empty array for no match", async () => {
    const one = buildEvmContract();
    const two = buildEvmContract();

    await collection.insertMany([instanceToPlain(one), instanceToPlain(two)]);

    const found = await repository.findByType(EvmContractType.ERC1155);
    expect(found.length).toBe(0);
});

test("findByType - returns contract matches", async () => {
    const one = buildEvmContract();
    const two = buildEvmContract();
    const three = buildEvmContract();
    two.type = EvmContractType.ERC1155;
    three.type = EvmContractType.ERC1155;

    await collection.insertMany([instanceToPlain(one), instanceToPlain(two), instanceToPlain(three)]);

    const found = await repository.findByType(EvmContractType.ERC1155);
    expect(found.length).toBe(2);
    expect(found).toMatchObject([two, three]);
});

test("findByTypeAndActive - returns empty array when type doesnt match", async () => {
    const one = buildEvmContract();
    const two = buildEvmContract();
    const three = buildEvmContract();

    await collection.insertMany([instanceToPlain(one), instanceToPlain(two), instanceToPlain(three)]);

    const found = await repository.findByTypeAndActive(EvmContractType.ERC1155, true);
    expect(found.length).toBe(0);
});

test("findByTypeAndActive - returns empty array when active doesnt match", async () => {
    const one = buildEvmContract();
    const two = buildEvmContract();
    const three = buildEvmContract();

    await collection.insertMany([instanceToPlain(one), instanceToPlain(two), instanceToPlain(three)]);

    const found = await repository.findByTypeAndActive(EvmContractType.MARKETPLACE, false);
    expect(found.length).toBe(0);
});

test("findByTypeAndActive - returns active contract matches", async () => {
    const one = buildEvmContract();
    const two = buildEvmContract();
    const three = buildEvmContract();
    const four = buildEvmContract();
    one.isActive = false;
    two.type = EvmContractType.ERC1155;

    await collection.insertMany([
        instanceToPlain(one),
        instanceToPlain(two),
        instanceToPlain(three),
        instanceToPlain(four)
    ]);

    const found = await repository.findByTypeAndActive(EvmContractType.MARKETPLACE, true);
    expect(found.length).toBe(2);
    expect(found).toMatchObject([three, four]);
});

test("findByTypeAndActive - returns inactive contract matches", async () => {
    const one = buildEvmContract();
    const two = buildEvmContract();
    const three = buildEvmContract();
    const four = buildEvmContract();
    four.type = EvmContractType.ERC1155;
    one.isActive = false;
    two.isActive = false;

    await collection.insertMany([
        instanceToPlain(one),
        instanceToPlain(two),
        instanceToPlain(three),
        instanceToPlain(four)
    ]);

    const found = await repository.findByTypeAndActive(EvmContractType.MARKETPLACE, false);
    expect(found.length).toBe(2);
    expect(found).toMatchObject([one, two]);
});
