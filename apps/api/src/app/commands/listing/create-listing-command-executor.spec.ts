import { ListingFactory } from "../../domain/listing/listing-factory";
import { CategoryRepository } from "../../support/categories/category-repository";
import { BlockchainRepository } from "../../support/blockchains/blockchain-repository";
import { NftViewRepository } from "../../views/nft/nft-view-repository";
import { CreateListingCommandExecutor } from "./create-listing-command-executor";
import { getUnitTestingModule } from "../../test-utils/test-modules";
import { CreateListingCommand } from "./create-listing-command";
import { Blockchain } from "../../support/blockchains/blockchain";
import { ObjectID } from "mongodb";
import { NftView } from "../../views/nft/nft-view";
import { BadRequestException } from "@nestjs/common";
import { Listing } from "../../domain/listing/listing";

let factory: ListingFactory;
let categoryRepository: CategoryRepository;
let blockchainRepository: BlockchainRepository;
let nftRepository: NftViewRepository;
let executor: CreateListingCommandExecutor;

beforeEach(async () => {
    const testModule = await getUnitTestingModule(CreateListingCommandExecutor);
    executor = testModule.get(CreateListingCommandExecutor);
    factory = testModule.get(ListingFactory);
    categoryRepository = testModule.get(CategoryRepository);
    blockchainRepository = testModule.get(BlockchainRepository);
    nftRepository = testModule.get(NftViewRepository);
});

test("execute - throws when category is not found", async () => {
    const command = new CreateListingCommand();
    command.nftId = "nft";
    command.categoryId = "cat";
    command.userId = "the-user";
    command.blockchainId = "block id";
    command.chainTokenId = "tok";
    command.tokenContractAddress = "address";
    command.price = 4;

    const categorySpy = jest.spyOn(categoryRepository, "countById").mockResolvedValue(0);

    await expect(executor.execute(command)).rejects.toThrow(BadRequestException);

    expect(categorySpy).toHaveBeenCalledWith("cat");
    expect(categorySpy).toHaveBeenCalledTimes(1);
});

test("execute - throws when blockchain is not found", async () => {
    const command = new CreateListingCommand();
    command.nftId = "nft";
    command.categoryId = "cat";
    command.userId = "the-user";
    command.blockchainId = "block id";
    command.chainTokenId = "tok";
    command.tokenContractAddress = "address";
    command.price = 4;

    const categorySpy = jest.spyOn(categoryRepository, "countById").mockResolvedValue(1);
    const blockchainSpy = jest.spyOn(blockchainRepository, "findById").mockResolvedValue(null);

    await expect(executor.execute(command)).rejects.toThrow(BadRequestException);

    expect(categorySpy).toHaveBeenCalledWith("cat");
    expect(categorySpy).toHaveBeenCalledTimes(1);

    expect(blockchainSpy).toHaveBeenCalledWith(command.blockchainId);
    expect(blockchainSpy).toHaveBeenCalledTimes(1);
});

test("execute - throws when nft id is set and not found", async () => {
    const blockchain = new Blockchain();
    blockchain.id = new ObjectID().toHexString();

    const command = new CreateListingCommand();
    command.nftId = "nft";
    command.categoryId = "cat";
    command.userId = "the-user";
    command.blockchainId = blockchain.id;
    command.chainTokenId = "tok";
    command.tokenContractAddress = "address";
    command.price = 4;

    const categorySpy = jest.spyOn(categoryRepository, "countById").mockResolvedValue(1);
    const blockchainSpy = jest.spyOn(blockchainRepository, "findById").mockResolvedValue(blockchain);
    const nftSpy = jest.spyOn(nftRepository, "findById").mockResolvedValue(null);

    await expect(executor.execute(command)).rejects.toThrow(BadRequestException);

    expect(categorySpy).toHaveBeenCalledWith("cat");
    expect(categorySpy).toHaveBeenCalledTimes(1);

    expect(blockchainSpy).toHaveBeenCalledWith(blockchain.id);
    expect(blockchainSpy).toHaveBeenCalledTimes(1);

    expect(nftSpy).toHaveBeenCalledWith("nft");
    expect(nftSpy).toHaveBeenCalledTimes(1);
});

test("execute - throws when blockchain id doesn't match nft blockchain", async () => {
    const command = new CreateListingCommand();
    command.nftId = "nft";
    command.categoryId = "cat";
    command.userId = "the-user";
    command.blockchainId = "block";
    command.chainTokenId = "tok";
    command.tokenContractAddress = "address";
    command.price = 4;

    const blockchain = new Blockchain();
    blockchain.id = new ObjectID().toHexString();

    const nftView = new NftView();

    const categorySpy = jest.spyOn(categoryRepository, "countById").mockResolvedValue(1);
    const blockchainSpy = jest.spyOn(blockchainRepository, "findById").mockResolvedValue(blockchain);
    const nftSpy = jest.spyOn(nftRepository, "findById").mockResolvedValue(nftView);

    await expect(executor.execute(command)).rejects.toThrow(BadRequestException);

    expect(categorySpy).toHaveBeenCalledWith("cat");
    expect(categorySpy).toHaveBeenCalledTimes(1);

    expect(blockchainSpy).toHaveBeenCalledWith("block");
    expect(blockchainSpy).toHaveBeenCalledTimes(1);

    expect(nftSpy).toHaveBeenCalledWith("nft");
    expect(nftSpy).toHaveBeenCalledTimes(1);
});

test("execute - creates listing and commits", async () => {
    const blockchain = new Blockchain();
    blockchain.id = new ObjectID().toHexString();

    const command = new CreateListingCommand();
    command.nftId = "nft";
    command.categoryId = "cat";
    command.userId = "the-user";
    command.blockchainId = blockchain.id;
    command.chainTokenId = "tok";
    command.tokenContractAddress = "address";
    command.price = 4;

    const nftView = new NftView();
    nftView.blockchainId = blockchain.id;

    const categorySpy = jest.spyOn(categoryRepository, "countById").mockResolvedValue(1);
    const blockchainSpy = jest.spyOn(blockchainRepository, "findById").mockResolvedValue(blockchain);
    const nftSpy = jest.spyOn(nftRepository, "findById").mockResolvedValue(nftView);

    const model: Listing = Listing.create("the-id", command);

    const factorySpy = jest.spyOn(factory, "createNew").mockReturnValue(model);
    const commitSpy = jest.spyOn(model, "commit").mockResolvedValue(model);

    const result = await executor.execute(command);

    expect(result.id).toBe("the-id");
    expect(result.version).toBe(0);

    expect(categorySpy).toHaveBeenCalledWith("cat");
    expect(categorySpy).toHaveBeenCalledTimes(1);

    expect(blockchainSpy).toHaveBeenCalledWith(blockchain.id);
    expect(blockchainSpy).toHaveBeenCalledTimes(1);

    expect(nftSpy).toHaveBeenCalledWith("nft");
    expect(nftSpy).toHaveBeenCalledTimes(1);

    expect(factorySpy).toHaveBeenCalledWith(command);
    expect(factorySpy).toHaveBeenCalledTimes(1);

    expect(commitSpy).toHaveBeenCalledTimes(1);
});