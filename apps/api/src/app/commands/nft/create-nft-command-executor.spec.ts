import { TestingModule } from "@nestjs/testing";
import { getUnitTestingModule } from "../../test-utils/test-modules";
import { CreateNftCommandExecutor } from "./create-nft-command-executor";
import { CategoryRepository } from "../../support/categories/category-repository";
import { BlockchainRepository } from "../../support/blockchains/blockchain-repository";
import { UserWalletViewRepository } from "../../views/user-wallet/user-wallet-view-repository";
import { CollectionViewRepository } from "../../views/collection/collection-view-repository";
import { CreateNftCommand } from "./create-nft-command";
import { BadRequestException } from "@nestjs/common";
import { UserWalletView } from "../../views/user-wallet/user-wallet-view";
import { Category } from "../../support/categories/category";
import { Blockchain } from "../../support/blockchains/blockchain";

let testModule: TestingModule;
let executor: CreateNftCommandExecutor;
let categoryRepo: CategoryRepository;
let blockchainRepo: BlockchainRepository;
let userWalletRepo: UserWalletViewRepository;
let collectionRepo: CollectionViewRepository;

beforeEach(async () => {
    testModule = await getUnitTestingModule(CreateNftCommandExecutor);
    executor = testModule.get(CreateNftCommandExecutor);
    categoryRepo = testModule.get(CategoryRepository);
    blockchainRepo = testModule.get(BlockchainRepository);
    userWalletRepo = testModule.get(UserWalletViewRepository);
    collectionRepo = testModule.get(CollectionViewRepository);
});

test("execute - throws if blockchain is not found", async () => {
    const command = new CreateNftCommand();
    command.categoryId = "cat";
    command.chainId = "chain";
    command.walletId = "wallet";
    command.userId = "user";

    const wallet = new UserWalletView();
    const category = new Category();

    const categorySpy = jest.spyOn(categoryRepo, "findById").mockResolvedValue(category);
    const blockchainSpy = jest.spyOn(blockchainRepo, "findById").mockResolvedValue(null);
    const walletSpy = jest.spyOn(userWalletRepo, "findByUserIdAndWalletIdAndChainId").mockResolvedValue(wallet);

    await expect(executor.execute(command)).rejects.toThrow(BadRequestException);

    expect(categorySpy).toHaveBeenCalledTimes(1);
    expect(categorySpy).toHaveBeenCalledWith("cat");

    expect(blockchainSpy).toHaveBeenCalledTimes(1);
    expect(blockchainSpy).toHaveBeenCalledWith("chain");

    expect(walletSpy).toHaveBeenCalledTimes(1);
    expect(walletSpy).toHaveBeenCalledWith("user", "wallet", "chain");
});

test("execute - throws if wallet is not found", async () => {
    const command = new CreateNftCommand();
    command.categoryId = "cat";
    command.chainId = "chain";
    command.walletId = "wallet";
    command.userId = "user";

    const blockchain = new Blockchain();
    const category = new Category();

    const categorySpy = jest.spyOn(categoryRepo, "findById").mockResolvedValue(category);
    const blockchainSpy = jest.spyOn(blockchainRepo, "findById").mockResolvedValue(blockchain);
    const walletSpy = jest.spyOn(userWalletRepo, "findByUserIdAndWalletIdAndChainId").mockResolvedValue(null);

    await expect(executor.execute(command)).rejects.toThrow(BadRequestException);

    expect(categorySpy).toHaveBeenCalledTimes(1);
    expect(categorySpy).toHaveBeenCalledWith("cat");

    expect(blockchainSpy).toHaveBeenCalledTimes(1);
    expect(blockchainSpy).toHaveBeenCalledWith("chain");

    expect(walletSpy).toHaveBeenCalledTimes(1);
    expect(walletSpy).toHaveBeenCalledWith("user", "wallet", "chain");
});

test("execute - throws if category is not found", async () => {
    const command = new CreateNftCommand();
    command.categoryId = "cat";
    command.chainId = "chain";
    command.walletId = "wallet";
    command.userId = "user";

    const wallet = new UserWalletView();
    const blockchain = new Blockchain();

    const categorySpy = jest.spyOn(categoryRepo, "findById").mockResolvedValue(null);
    const blockchainSpy = jest.spyOn(blockchainRepo, "findById").mockResolvedValue(blockchain);
    const walletSpy = jest.spyOn(userWalletRepo, "findByUserIdAndWalletIdAndChainId").mockResolvedValue(wallet);

    await expect(executor.execute(command)).rejects.toThrow(BadRequestException);

    expect(categorySpy).toHaveBeenCalledTimes(1);
    expect(categorySpy).toHaveBeenCalledWith("cat");

    expect(blockchainSpy).toHaveBeenCalledTimes(1);
    expect(blockchainSpy).toHaveBeenCalledWith("chain");

    expect(walletSpy).toHaveBeenCalledTimes(1);
    expect(walletSpy).toHaveBeenCalledWith("user", "wallet", "chain");
});

test("execute - throws if collection is not found", async () => {
    const command = new CreateNftCommand();
    command.categoryId = "cat";
    command.chainId = "chain";
    command.walletId = "wallet";
    command.userId = "user";
    command.collectionId = "collection";

    const wallet = new UserWalletView();
    const blockchain = new Blockchain();
    const category = new Category();

    const categorySpy = jest.spyOn(categoryRepo, "findById").mockResolvedValue(category);
    const blockchainSpy = jest.spyOn(blockchainRepo, "findById").mockResolvedValue(blockchain);
    const walletSpy = jest.spyOn(userWalletRepo, "findByUserIdAndWalletIdAndChainId").mockResolvedValue(wallet);
    const collectionSpy = jest.spyOn(collectionRepo, "findByUserIdAndId").mockResolvedValue(null);

    await expect(executor.execute(command)).rejects.toThrow(BadRequestException);

    expect(categorySpy).toHaveBeenCalledTimes(1);
    expect(categorySpy).toHaveBeenCalledWith("cat");

    expect(blockchainSpy).toHaveBeenCalledTimes(1);
    expect(blockchainSpy).toHaveBeenCalledWith("chain");

    expect(walletSpy).toHaveBeenCalledTimes(1);
    expect(walletSpy).toHaveBeenCalledWith("user", "wallet", "chain");

    expect(collectionSpy).toHaveBeenCalledTimes(1);
    expect(collectionSpy).toHaveBeenCalledWith("user", "collection");
});
