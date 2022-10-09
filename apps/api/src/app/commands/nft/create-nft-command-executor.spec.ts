import { NftFactory } from "./../../domain/nft/nft-factory";
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
import { CollectionView } from "../../views/collection/collection-view";
import { NftDto } from "@swan/dto";
import { Nft } from "../../domain/nft/nft";
import { ObjectId } from "mongodb";

let testModule: TestingModule;
let executor: CreateNftCommandExecutor;
let categoryRepo: CategoryRepository;
let blockchainRepo: BlockchainRepository;
let userWalletRepo: UserWalletViewRepository;
let collectionRepo: CollectionViewRepository;
let nftFactory: NftFactory;

beforeEach(async () => {
    testModule = await getUnitTestingModule(CreateNftCommandExecutor);
    executor = testModule.get(CreateNftCommandExecutor);
    categoryRepo = testModule.get(CategoryRepository);
    blockchainRepo = testModule.get(BlockchainRepository);
    userWalletRepo = testModule.get(UserWalletViewRepository);
    collectionRepo = testModule.get(CollectionViewRepository);
    nftFactory = testModule.get(NftFactory);
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

test("execute - Returns NftDto with valid data", async () => {
    const command = new CreateNftCommand();
    command.categoryId = "cat";
    command.chainId = "chain";
    command.walletId = "wallet";
    command.userId = "user";
    command.collectionId = "collection";
    command.resellPercentage = 3;
    command.description = "test";
    command.imageType = "img/png";
    command.imageName = "test.png";
    command.maxSupply = 3;
    command.s3uri = "https://test.test";
    command.name = "test";

    const wallet = new UserWalletView();
    wallet.id = new ObjectId().toHexString();
    const blockchain = new Blockchain();
    const category = new Category();
    category.name = "cat";
    const collection = new CollectionView();
    collection.name = "testCol";
    const newNft = Nft.create("nftId", command.userId, command.chainId, command.categoryId, command.walletId);

    const categorySpy = jest.spyOn(categoryRepo, "findById").mockResolvedValue(category);
    const blockchainSpy = jest.spyOn(blockchainRepo, "findById").mockResolvedValue(blockchain);
    const walletSpy = jest.spyOn(userWalletRepo, "findByUserIdAndWalletIdAndChainId").mockResolvedValue(wallet);
    const collectionSpy = jest.spyOn(collectionRepo, "findByUserIdAndId").mockResolvedValue(collection);
    const factorySpy = jest.spyOn(nftFactory, "createNew").mockReturnValue(newNft);
    const nftUploadSpy = jest.spyOn(Nft.prototype, "uploadFiles").mockResolvedValue(newNft);
    const nftCommitSpy = jest.spyOn(Nft.prototype, "commit").mockResolvedValue(newNft);

    const returned = await executor.execute(command);

    expect(categorySpy).toHaveBeenCalledTimes(1);
    expect(categorySpy).toHaveBeenCalledWith("cat");

    expect(blockchainSpy).toHaveBeenCalledTimes(1);
    expect(blockchainSpy).toHaveBeenCalledWith("chain");

    expect(walletSpy).toHaveBeenCalledTimes(1);
    expect(walletSpy).toHaveBeenCalledWith("user", "wallet", "chain");

    expect(collectionSpy).toHaveBeenCalledTimes(1);
    expect(collectionSpy).toHaveBeenCalledWith("user", "collection");

    expect(factorySpy).toHaveBeenCalledTimes(1);
    expect(factorySpy).toHaveBeenCalledWith("user", "chain", "cat", wallet.id);

    expect(nftUploadSpy).toHaveBeenCalledTimes(1);
    expect(nftCommitSpy).toHaveBeenCalledTimes(1);

    const expected = new NftDto(newNft.metadataUri, newNft.id);
    expect(returned.id).toBe(expected.id);
    expect(returned.metadataUri).toBe(expected.metadataUri);
});
