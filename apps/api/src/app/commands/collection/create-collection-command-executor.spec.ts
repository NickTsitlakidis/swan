import { CollectionFactory } from "../../domain/collection/collection-factory";
import { CollectionViewRepository } from "../../views/collection/collection-view-repository";
import { CategoryRepository } from "../../support/categories/category-repository";
import { BlockchainRepository } from "../../support/blockchains/blockchain-repository";
import { CreateCollectionCommandExecutor } from "./create-collection-command-executor";
import { getUnitTestingModule } from "../../test-utils/test-modules";
import { CreateCollectionCommand } from "./create-collection-command";
import { BadRequestException } from "@nestjs/common";
import { Blockchain } from "../../support/blockchains/blockchain";
import { Collection } from "../../domain/collection/collection";
import { buildBlockchain } from "../../test-utils/test-builders";

let factory: CollectionFactory;
let collectionRepo: CollectionViewRepository;
let categoryRepo: CategoryRepository;
let blockchainRepo: BlockchainRepository;
let executor: CreateCollectionCommandExecutor;

beforeEach(async () => {
    const testModule = await getUnitTestingModule(CreateCollectionCommandExecutor);
    factory = testModule.get(CollectionFactory);
    collectionRepo = testModule.get(CollectionViewRepository);
    categoryRepo = testModule.get(CategoryRepository);
    blockchainRepo = testModule.get(BlockchainRepository);
    executor = testModule.get(CreateCollectionCommandExecutor);
});

test("execute - throws bad request for missing category", async () => {
    const collectionSpy = jest.spyOn(collectionRepo, "countByName").mockResolvedValue(0);
    const categorySpy = jest.spyOn(categoryRepo, "countById").mockResolvedValue(0);
    const blockchainSpy = jest.spyOn(blockchainRepo, "findById").mockResolvedValue(buildBlockchain());

    const command = new CreateCollectionCommand();
    command.blockchainId = "block";
    command.categoryId = "category";
    command.name = "name";

    await expect(executor.execute(command)).rejects.toThrow(BadRequestException);

    expect(blockchainSpy).toHaveBeenCalledWith("block");
    expect(blockchainSpy).toHaveBeenCalledTimes(1);

    expect(categorySpy).toHaveBeenCalledWith("category");
    expect(categorySpy).toHaveBeenCalledTimes(1);

    expect(collectionSpy).toHaveBeenCalledWith("name");
    expect(collectionSpy).toHaveBeenCalledTimes(1);
});

test("execute - throws bad request for invalid blockchain id", async () => {
    const collectionSpy = jest.spyOn(collectionRepo, "countByName").mockResolvedValue(0);
    const categorySpy = jest.spyOn(categoryRepo, "countById").mockResolvedValue(1);
    const blockchainSpy = jest.spyOn(blockchainRepo, "findById").mockResolvedValue(undefined);

    const command = new CreateCollectionCommand();
    command.blockchainId = "block";
    command.categoryId = "category";
    command.name = "name";

    await expect(executor.execute(command)).rejects.toThrow(BadRequestException);

    expect(blockchainSpy).toHaveBeenCalledWith("block");
    expect(blockchainSpy).toHaveBeenCalledTimes(1);

    expect(categorySpy).toHaveBeenCalledWith("category");
    expect(categorySpy).toHaveBeenCalledTimes(1);

    expect(collectionSpy).toHaveBeenCalledWith("name");
    expect(collectionSpy).toHaveBeenCalledTimes(1);
});

test("execute - throws bad request for invalid payment token", async () => {
    const collectionSpy = jest.spyOn(collectionRepo, "countByName").mockResolvedValue(0);
    const categorySpy = jest.spyOn(categoryRepo, "countById").mockResolvedValue(1);

    const blockchain = new Blockchain();
    blockchain.mainTokenSymbol = "ETH";
    const blockchainSpy = jest.spyOn(blockchainRepo, "findById").mockResolvedValue(blockchain);

    const command = new CreateCollectionCommand();
    command.blockchainId = "block";
    command.categoryId = "category";
    command.name = "name";
    command.paymentToken = "SOL";

    await expect(executor.execute(command)).rejects.toThrow(BadRequestException);

    expect(blockchainSpy).toHaveBeenCalledWith("block");
    expect(blockchainSpy).toHaveBeenCalledTimes(1);

    expect(categorySpy).toHaveBeenCalledWith("category");
    expect(categorySpy).toHaveBeenCalledTimes(1);

    expect(collectionSpy).toHaveBeenCalledWith("name");
    expect(collectionSpy).toHaveBeenCalledTimes(1);
});

test("execute - throws bad request for existing custom url", async () => {
    const collectionSpy = jest.spyOn(collectionRepo, "countByName").mockResolvedValue(0);
    const categorySpy = jest.spyOn(categoryRepo, "countById").mockResolvedValue(1);

    const blockchain = new Blockchain();
    blockchain.mainTokenSymbol = "ETH";
    const blockchainSpy = jest.spyOn(blockchainRepo, "findById").mockResolvedValue(blockchain);

    const customUrlSpy = jest.spyOn(collectionRepo, "countByCustomUrl").mockResolvedValue(1);

    const command = new CreateCollectionCommand();
    command.blockchainId = "block";
    command.categoryId = "category";
    command.name = "name";
    command.customUrl = "the-url";
    command.paymentToken = "ETH";

    await expect(executor.execute(command)).rejects.toThrow(BadRequestException);

    expect(blockchainSpy).toHaveBeenCalledWith("block");
    expect(blockchainSpy).toHaveBeenCalledTimes(1);

    expect(categorySpy).toHaveBeenCalledWith("category");
    expect(categorySpy).toHaveBeenCalledTimes(1);

    expect(collectionSpy).toHaveBeenCalledWith("name");
    expect(collectionSpy).toHaveBeenCalledTimes(1);

    expect(customUrlSpy).toHaveBeenCalledTimes(1);
    expect(customUrlSpy).toHaveBeenCalledWith("the-url");
});

test("execute - throws bad request for existing name", async () => {
    const collectionSpy = jest.spyOn(collectionRepo, "countByName").mockResolvedValue(1);
    const categorySpy = jest.spyOn(categoryRepo, "countById").mockResolvedValue(1);

    const blockchain = new Blockchain();
    blockchain.mainTokenSymbol = "ETH";
    const blockchainSpy = jest.spyOn(blockchainRepo, "findById").mockResolvedValue(blockchain);

    const command = new CreateCollectionCommand();
    command.blockchainId = "block";
    command.categoryId = "category";
    command.name = "name";

    await expect(executor.execute(command)).rejects.toThrow(BadRequestException);

    expect(blockchainSpy).toHaveBeenCalledWith("block");
    expect(blockchainSpy).toHaveBeenCalledTimes(1);

    expect(categorySpy).toHaveBeenCalledWith("category");
    expect(categorySpy).toHaveBeenCalledTimes(1);

    expect(collectionSpy).toHaveBeenCalledWith("name");
    expect(collectionSpy).toHaveBeenCalledTimes(1);
});

test("execute - creates and stores collection", async () => {
    const collectionSpy = jest.spyOn(collectionRepo, "countByName").mockResolvedValue(0);
    const categorySpy = jest.spyOn(categoryRepo, "countById").mockResolvedValue(1);

    const blockchain = new Blockchain();
    blockchain.mainTokenSymbol = "ETH";
    const blockchainSpy = jest.spyOn(blockchainRepo, "findById").mockResolvedValue(blockchain);

    const customUrlSpy = jest.spyOn(collectionRepo, "countByCustomUrl").mockResolvedValue(0);

    const command = new CreateCollectionCommand();
    command.blockchainId = "block";
    command.categoryId = "category";
    command.name = "name";
    command.customUrl = "the-url";
    command.paymentToken = "ETH";

    const collection = Collection.create("col-id", command);
    const factorySpy = jest.spyOn(factory, "createNew").mockReturnValue(collection);
    const commitSpy = jest.spyOn(collection, "commit").mockResolvedValue(collection);

    const result = await executor.execute(command);

    expect(result.id).toBe("col-id");

    expect(blockchainSpy).toHaveBeenCalledWith("block");
    expect(blockchainSpy).toHaveBeenCalledTimes(1);

    expect(categorySpy).toHaveBeenCalledWith("category");
    expect(categorySpy).toHaveBeenCalledTimes(1);

    expect(collectionSpy).toHaveBeenCalledWith("name");
    expect(collectionSpy).toHaveBeenCalledTimes(1);

    expect(customUrlSpy).toHaveBeenCalledTimes(1);
    expect(customUrlSpy).toHaveBeenCalledWith("the-url");

    expect(factorySpy).toHaveBeenCalledTimes(1);
    expect(factorySpy).toHaveBeenCalledWith(command);

    expect(commitSpy).toHaveBeenCalledTimes(1);
});
