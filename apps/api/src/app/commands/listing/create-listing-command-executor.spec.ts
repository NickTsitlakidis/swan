import { BlockchainWallet } from "../../support/blockchains/blockchain-wallet";
import { ListingFactory } from "../../domain/listing/listing-factory";
import { CategoryRepository } from "../../support/categories/category-repository";
import { BlockchainRepository } from "../../support/blockchains/blockchain-repository";
import { NftViewRepository } from "../../views/nft/nft-view-repository";
import { CreateListingCommandExecutor } from "./create-listing-command-executor";
import { getUnitTestingModule } from "../../test-utils/test-modules";
import { CreateListingCommand } from "./create-listing-command";
import { Blockchain } from "../../support/blockchains/blockchain";
import { ObjectId, ObjectID } from "mongodb";
import { NftView } from "../../views/nft/nft-view";
import { BadRequestException } from "@nestjs/common";
import { Listing } from "../../domain/listing/listing";
import { SignatureTypes } from "../../support/blockchains/signature-types";
import { BlockchainWalletRepository } from "../../support/blockchains/blockchain-wallet-repository";
import { createMock } from "@golevelup/ts-jest";
import { UserWalletViewRepository } from "../../views/user-wallet/user-wallet-view-repository";
import { buildUserWalletView } from "../../test-utils/test-builders";

let factory: ListingFactory;
let categoryRepository: CategoryRepository;
let blockchainRepository: BlockchainRepository;
let nftRepository: NftViewRepository;
let executor: CreateListingCommandExecutor;
let blockchainWalletRepository: BlockchainWalletRepository;
let userWalletRepository: UserWalletViewRepository;

beforeEach(async () => {
    const testModule = await getUnitTestingModule(CreateListingCommandExecutor);
    executor = testModule.get(CreateListingCommandExecutor);
    factory = testModule.get(ListingFactory);
    categoryRepository = testModule.get(CategoryRepository);
    blockchainRepository = testModule.get(BlockchainRepository);
    nftRepository = testModule.get(NftViewRepository);
    blockchainWalletRepository = testModule.get(BlockchainWalletRepository);
    userWalletRepository = testModule.get(UserWalletViewRepository);
});

test("execute - throws when category is not found", async () => {
    const command = new CreateListingCommand();
    command.nftId = "nft";
    command.categoryId = "cat";
    command.userId = "the-user";
    command.blockchainId = "block id";
    command.chainTokenId = "tok";
    command.tokenContractAddress = "address";
    command.nftAddress = "nftAddress";
    command.price = 4;
    command.animationUrl = "animationUrl";
    command.imageUrl = "imageUrl";
    command.walletId = "walletId";

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
    command.nftAddress = "nftAddress";
    command.price = 4;
    command.animationUrl = "animationUrl";
    command.imageUrl = "imageUrl";
    command.walletId = "walletId";

    const wallet: BlockchainWallet = {
        blockchainId: command.blockchainId,
        id: "blockWalletId",
        walletId: command.walletId,
        _id: new ObjectId()
    };

    const userWallet = buildUserWalletView();
    const userWalletSpy = jest
        .spyOn(userWalletRepository, "findByUserIdAndWalletIdAndChainId")
        .mockResolvedValue(userWallet);

    const blockchainWalletSpy = jest
        .spyOn(blockchainWalletRepository, "findByWalletIdAndBlockchainId")
        .mockResolvedValue(wallet);
    const categorySpy = jest.spyOn(categoryRepository, "countById").mockResolvedValue(1);
    const blockchainSpy = jest.spyOn(blockchainRepository, "findById").mockResolvedValue(null);

    await expect(executor.execute(command)).rejects.toThrow(BadRequestException);

    expect(categorySpy).toHaveBeenCalledWith("cat");
    expect(categorySpy).toHaveBeenCalledTimes(1);

    expect(blockchainSpy).toHaveBeenCalledWith(command.blockchainId);
    expect(blockchainSpy).toHaveBeenCalledTimes(1);

    expect(userWalletSpy).toHaveBeenCalledTimes(1);
    expect(userWalletSpy).toHaveBeenCalledWith(command.userId, command.walletId, command.blockchainId);

    expect(blockchainWalletSpy).toHaveBeenCalledWith(command.walletId, command.blockchainId);
    expect(blockchainWalletSpy).toHaveBeenCalledTimes(1);
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
    command.nftAddress = "nftAddress";
    command.price = 4;
    command.animationUrl = "animationUrl";
    command.imageUrl = "imageUrl";
    command.walletId = "walletId";

    const wallet: BlockchainWallet = {
        blockchainId: command.blockchainId,
        id: "blockWalletId",
        walletId: command.walletId,
        _id: new ObjectId()
    };

    const blockchainWalletSpy = jest
        .spyOn(blockchainWalletRepository, "findByWalletIdAndBlockchainId")
        .mockResolvedValue(wallet);

    const categorySpy = jest.spyOn(categoryRepository, "countById").mockResolvedValue(1);
    const blockchainSpy = jest.spyOn(blockchainRepository, "findById").mockResolvedValue(blockchain);
    const nftSpy = jest.spyOn(nftRepository, "findById").mockResolvedValue(null);

    const userWallet = buildUserWalletView();
    const userWalletSpy = jest
        .spyOn(userWalletRepository, "findByUserIdAndWalletIdAndChainId")
        .mockResolvedValue(userWallet);

    await expect(executor.execute(command)).rejects.toThrow(BadRequestException);

    expect(categorySpy).toHaveBeenCalledWith("cat");
    expect(categorySpy).toHaveBeenCalledTimes(1);

    expect(userWalletSpy).toHaveBeenCalledTimes(1);
    expect(userWalletSpy).toHaveBeenCalledWith(command.userId, command.walletId, command.blockchainId);

    expect(blockchainSpy).toHaveBeenCalledWith(blockchain.id);
    expect(blockchainSpy).toHaveBeenCalledTimes(1);

    expect(blockchainWalletSpy).toHaveBeenCalledWith(command.walletId, command.blockchainId);
    expect(blockchainWalletSpy).toHaveBeenCalledTimes(1);

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
    command.nftAddress = "nftAddress";
    command.price = 4;
    command.animationUrl = "animationUrl";
    command.imageUrl = "imageUrl";
    command.walletId = "walletId";

    const wallet: BlockchainWallet = {
        blockchainId: command.blockchainId,
        id: "blockWalletId",
        walletId: command.walletId,
        _id: new ObjectId()
    };

    const blockchainWalletSpy = jest
        .spyOn(blockchainWalletRepository, "findByWalletIdAndBlockchainId")
        .mockResolvedValue(wallet);

    const blockchain = new Blockchain();
    blockchain.id = new ObjectID().toHexString();

    const nftView = new NftView();

    const categorySpy = jest.spyOn(categoryRepository, "countById").mockResolvedValue(1);
    const blockchainSpy = jest.spyOn(blockchainRepository, "findById").mockResolvedValue(blockchain);
    const nftSpy = jest.spyOn(nftRepository, "findById").mockResolvedValue(nftView);

    const userWallet = buildUserWalletView();
    const userWalletSpy = jest
        .spyOn(userWalletRepository, "findByUserIdAndWalletIdAndChainId")
        .mockResolvedValue(userWallet);

    await expect(executor.execute(command)).rejects.toThrow(BadRequestException);

    expect(categorySpy).toHaveBeenCalledWith("cat");
    expect(categorySpy).toHaveBeenCalledTimes(1);

    expect(blockchainSpy).toHaveBeenCalledWith("block");
    expect(blockchainSpy).toHaveBeenCalledTimes(1);

    expect(blockchainWalletSpy).toHaveBeenCalledWith(command.walletId, command.blockchainId);
    expect(blockchainWalletSpy).toHaveBeenCalledTimes(1);

    expect(nftSpy).toHaveBeenCalledWith("nft");
    expect(nftSpy).toHaveBeenCalledTimes(1);

    expect(userWalletSpy).toHaveBeenCalledTimes(1);
    expect(userWalletSpy).toHaveBeenCalledWith(command.userId, command.walletId, command.blockchainId);
});

test("execute - throws when tokenContractAddress is missing from create listing command (EVM)", async () => {
    const blockchain = new Blockchain();
    blockchain.id = new ObjectID().toHexString();
    blockchain.signatureType = SignatureTypes.EVM;

    const command = new CreateListingCommand();
    command.nftId = "nft";
    command.categoryId = "cat";
    command.userId = "the-user";
    command.blockchainId = blockchain.id;
    command.chainTokenId = "tok";
    command.nftAddress = "nftAddress";
    command.price = 4;
    command.animationUrl = "animationUrl";
    command.imageUrl = "imageUrl";
    command.walletId = "walletId";

    const wallet: BlockchainWallet = {
        blockchainId: command.blockchainId,
        id: "blockWalletId",
        walletId: command.walletId,
        _id: new ObjectId()
    };

    const blockchainWalletSpy = jest
        .spyOn(blockchainWalletRepository, "findByWalletIdAndBlockchainId")
        .mockResolvedValue(wallet);

    const nftView = new NftView();
    nftView.blockchainId = blockchain.id;

    const categorySpy = jest.spyOn(categoryRepository, "countById").mockResolvedValue(1);
    const blockchainSpy = jest.spyOn(blockchainRepository, "findById").mockResolvedValue(blockchain);
    const nftSpy = jest.spyOn(nftRepository, "findById").mockResolvedValue(nftView);

    const userWallet = buildUserWalletView();
    const userWalletSpy = jest
        .spyOn(userWalletRepository, "findByUserIdAndWalletIdAndChainId")
        .mockResolvedValue(userWallet);

    await expect(executor.execute(command)).rejects.toThrow(BadRequestException);

    expect(categorySpy).toHaveBeenCalledWith("cat");
    expect(categorySpy).toHaveBeenCalledTimes(1);

    expect(blockchainSpy).toHaveBeenCalledWith(blockchain.id);
    expect(blockchainSpy).toHaveBeenCalledTimes(1);

    expect(blockchainWalletSpy).toHaveBeenCalledWith(command.walletId, command.blockchainId);
    expect(blockchainWalletSpy).toHaveBeenCalledTimes(1);

    expect(nftSpy).toHaveBeenCalledWith("nft");
    expect(nftSpy).toHaveBeenCalledTimes(1);

    expect(userWalletSpy).toHaveBeenCalledTimes(1);
    expect(userWalletSpy).toHaveBeenCalledWith(command.userId, command.walletId, command.blockchainId);
});

test("execute - throws when chainTokenId is missing from create listing command (EVM)", async () => {
    const blockchain = new Blockchain();
    blockchain.id = new ObjectID().toHexString();
    blockchain.signatureType = SignatureTypes.EVM;

    const command = new CreateListingCommand();
    command.nftId = "nft";
    command.categoryId = "cat";
    command.userId = "the-user";
    command.blockchainId = blockchain.id;
    command.tokenContractAddress = "addr";
    command.nftAddress = "nftAddress";
    command.price = 4;
    command.animationUrl = "animationUrl";
    command.imageUrl = "imageUrl";
    command.walletId = "walletId";

    const wallet: BlockchainWallet = {
        blockchainId: command.blockchainId,
        id: "blockWalletId",
        walletId: command.walletId,
        _id: new ObjectId()
    };

    const blockchainWalletSpy = jest
        .spyOn(blockchainWalletRepository, "findByWalletIdAndBlockchainId")
        .mockResolvedValue(wallet);

    const nftView = new NftView();
    nftView.blockchainId = blockchain.id;

    const categorySpy = jest.spyOn(categoryRepository, "countById").mockResolvedValue(1);
    const blockchainSpy = jest.spyOn(blockchainRepository, "findById").mockResolvedValue(blockchain);
    const nftSpy = jest.spyOn(nftRepository, "findById").mockResolvedValue(nftView);

    const userWallet = buildUserWalletView();
    const userWalletSpy = jest
        .spyOn(userWalletRepository, "findByUserIdAndWalletIdAndChainId")
        .mockResolvedValue(userWallet);

    await expect(executor.execute(command)).rejects.toThrow(BadRequestException);

    expect(categorySpy).toHaveBeenCalledWith("cat");
    expect(categorySpy).toHaveBeenCalledTimes(1);

    expect(blockchainSpy).toHaveBeenCalledWith(blockchain.id);
    expect(blockchainSpy).toHaveBeenCalledTimes(1);

    expect(blockchainWalletSpy).toHaveBeenCalledWith(command.walletId, command.blockchainId);
    expect(blockchainWalletSpy).toHaveBeenCalledTimes(1);

    expect(nftSpy).toHaveBeenCalledWith("nft");
    expect(nftSpy).toHaveBeenCalledTimes(1);

    expect(userWalletSpy).toHaveBeenCalledTimes(1);
    expect(userWalletSpy).toHaveBeenCalledWith(command.userId, command.walletId, command.blockchainId);
});

test("execute - throws when nftAddress is missing from create listing command (Solana)", async () => {
    const blockchain = new Blockchain();
    blockchain.id = new ObjectID().toHexString();
    blockchain.signatureType = SignatureTypes.SOLANA;

    const command = new CreateListingCommand();
    command.nftId = "nft";
    command.categoryId = "cat";
    command.userId = "the-user";
    command.blockchainId = blockchain.id;
    command.tokenContractAddress = "addr";
    command.price = 4;
    command.animationUrl = "animationUrl";
    command.imageUrl = "imageUrl";
    command.walletId = "walletId";

    const wallet: BlockchainWallet = {
        blockchainId: command.blockchainId,
        id: "blockWalletId",
        walletId: command.walletId,
        _id: new ObjectId()
    };

    const blockchainWalletSpy = jest
        .spyOn(blockchainWalletRepository, "findByWalletIdAndBlockchainId")
        .mockResolvedValue(wallet);

    const nftView = new NftView();
    nftView.blockchainId = blockchain.id;

    const categorySpy = jest.spyOn(categoryRepository, "countById").mockResolvedValue(1);
    const blockchainSpy = jest.spyOn(blockchainRepository, "findById").mockResolvedValue(blockchain);
    const nftSpy = jest.spyOn(nftRepository, "findById").mockResolvedValue(nftView);

    const userWallet = buildUserWalletView();
    const userWalletSpy = jest
        .spyOn(userWalletRepository, "findByUserIdAndWalletIdAndChainId")
        .mockResolvedValue(userWallet);

    await expect(executor.execute(command)).rejects.toThrow(BadRequestException);

    expect(categorySpy).toHaveBeenCalledWith("cat");
    expect(categorySpy).toHaveBeenCalledTimes(1);

    expect(blockchainSpy).toHaveBeenCalledWith(blockchain.id);
    expect(blockchainSpy).toHaveBeenCalledTimes(1);

    expect(blockchainWalletSpy).toHaveBeenCalledWith(command.walletId, command.blockchainId);
    expect(blockchainWalletSpy).toHaveBeenCalledTimes(1);

    expect(nftSpy).toHaveBeenCalledWith("nft");
    expect(nftSpy).toHaveBeenCalledTimes(1);

    expect(userWalletSpy).toHaveBeenCalledTimes(1);
    expect(userWalletSpy).toHaveBeenCalledWith(command.userId, command.walletId, command.blockchainId);
});

test("execute - throws when blockChain wallet combination did not found in the DB", async () => {
    const blockchain = new Blockchain();
    blockchain.id = new ObjectID().toHexString();

    const command = new CreateListingCommand();
    command.nftId = "nft";
    command.categoryId = "cat";
    command.userId = "the-user";
    command.blockchainId = blockchain.id;
    command.chainTokenId = "tok";
    command.tokenContractAddress = "address";
    command.nftAddress = "nftAddress";
    command.price = 4;
    command.animationUrl = "animationUrl";
    command.imageUrl = "imageUrl";
    command.walletId = "walletId";

    const blockchainWalletSpy = jest
        .spyOn(blockchainWalletRepository, "findByWalletIdAndBlockchainId")
        .mockResolvedValue(null);

    const nftView = new NftView();
    nftView.blockchainId = blockchain.id;

    const categorySpy = jest.spyOn(categoryRepository, "countById").mockResolvedValue(1);
    const blockchainSpy = jest.spyOn(blockchainRepository, "findById").mockResolvedValue(blockchain);

    const userWallet = buildUserWalletView();
    const userWalletSpy = jest
        .spyOn(userWalletRepository, "findByUserIdAndWalletIdAndChainId")
        .mockResolvedValue(userWallet);

    await expect(executor.execute(command)).rejects.toThrow(BadRequestException);

    expect(categorySpy).toHaveBeenCalledWith("cat");
    expect(categorySpy).toHaveBeenCalledTimes(1);

    expect(blockchainSpy).toHaveBeenCalledWith(blockchain.id);
    expect(blockchainSpy).toHaveBeenCalledTimes(1);

    expect(blockchainWalletSpy).toHaveBeenCalledWith(command.walletId, command.blockchainId);
    expect(blockchainWalletSpy).toHaveBeenCalledTimes(1);

    expect(userWalletSpy).toHaveBeenCalledTimes(1);
    expect(userWalletSpy).toHaveBeenCalledWith(command.userId, command.walletId, command.blockchainId);
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
    command.nftAddress = "nftAddress";
    command.price = 4;
    command.animationUrl = "animationUrl";
    command.imageUrl = "imageUrl";
    command.walletId = "walletId";

    const wallet: BlockchainWallet = {
        blockchainId: command.blockchainId,
        id: "blockWalletId",
        walletId: command.walletId,
        _id: new ObjectId()
    };

    const blockchainWalletSpy = jest
        .spyOn(blockchainWalletRepository, "findByWalletIdAndBlockchainId")
        .mockResolvedValue(wallet);

    const userWallet = buildUserWalletView();
    const userWalletSpy = jest
        .spyOn(userWalletRepository, "findByUserIdAndWalletIdAndChainId")
        .mockResolvedValue(userWallet);

    const nftView = new NftView();
    nftView.blockchainId = blockchain.id;

    const categorySpy = jest.spyOn(categoryRepository, "countById").mockResolvedValue(1);
    const blockchainSpy = jest.spyOn(blockchainRepository, "findById").mockResolvedValue(blockchain);
    const nftSpy = jest.spyOn(nftRepository, "findById").mockResolvedValue(nftView);

    const model: Listing = Listing.create("the-id", command, "sellerAddress");

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

    expect(blockchainWalletSpy).toHaveBeenCalledWith(command.walletId, command.blockchainId);
    expect(blockchainWalletSpy).toHaveBeenCalledTimes(1);

    expect(factorySpy).toHaveBeenCalledWith(command, userWallet.address);
    expect(factorySpy).toHaveBeenCalledTimes(1);

    expect(commitSpy).toHaveBeenCalledTimes(1);

    expect(userWalletSpy).toHaveBeenCalledTimes(1);
    expect(userWalletSpy).toHaveBeenCalledWith(command.userId, command.walletId, command.blockchainId);
});
