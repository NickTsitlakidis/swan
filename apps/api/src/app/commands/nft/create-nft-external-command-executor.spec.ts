import { SolanaActionsService } from "../../support/blockchains/solana-actions-service";
import { CreateNftExternalCommandExecutor } from "./create-nft-external-command-executor";
import { NftFactory } from "../../domain/nft/nft-factory";
import { TestingModule } from "@nestjs/testing";
import { getUnitTestingModule } from "../../test-utils/test-modules";
import { CategoryRepository } from "../../support/categories/category-repository";
import { BlockchainRepository } from "../../support/blockchains/blockchain-repository";
import { UserWalletViewRepository } from "../../views/user-wallet/user-wallet-view-repository";
import { BadRequestException } from "@nestjs/common";
import { UserWalletView } from "../../views/user-wallet/user-wallet-view";
import { Category } from "../../support/categories/category";
import { Blockchain } from "../../support/blockchains/blockchain";
import { BlockchainActionsRegistryService } from "../../support/blockchains/blockchain-actions-registry-service";
import { CreateNftExternalCommand } from "./create-nft-external-command";
import { AwsService } from "../../support/aws/aws-service";
import { ConfigService } from "@nestjs/config";
import { MetaplexService } from "../../support/metaplex/metaplex-service";
import { HttpService } from "@nestjs/axios";
import { MetadataValidator } from "../../support/blockchains/metadata-validator";
import { ObjectId } from "@mikro-orm/mongodb";
import { BlockchainNftTransactionsResponse } from "../../support/blockchains/blockchain-nft-transactions";
import { Nft } from "../../domain/nft/nft";
import { NftDto } from "@swan/dto";

let testModule: TestingModule;
let executor: CreateNftExternalCommandExecutor;
let categoryRepo: CategoryRepository;
let blockchainRepo: BlockchainRepository;
let userWalletRepo: UserWalletViewRepository;
let nftFactory: NftFactory;
let blockchainActionsRegistryService: BlockchainActionsRegistryService;

beforeEach(async () => {
    testModule = await getUnitTestingModule(CreateNftExternalCommandExecutor);
    executor = testModule.get(CreateNftExternalCommandExecutor);
    categoryRepo = testModule.get(CategoryRepository);
    blockchainRepo = testModule.get(BlockchainRepository);
    userWalletRepo = testModule.get(UserWalletViewRepository);
    blockchainActionsRegistryService = testModule.get(BlockchainActionsRegistryService);
    nftFactory = testModule.get(NftFactory);
});

test("execute - throws if blockchain is not found", async () => {
    const command = new CreateNftExternalCommand();
    command.categoryId = "cat";
    command.walletId = "wallet";
    command.userId = "user";
    command.blockchainId = "chain";

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
    const command = new CreateNftExternalCommand();
    command.categoryId = "cat";
    command.blockchainId = "chain";
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
    const command = new CreateNftExternalCommand();
    command.categoryId = "cat";
    command.blockchainId = "chain";
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

test("execute - returns NftDto with valid data", async () => {
    const command = new CreateNftExternalCommand();
    command.categoryId = "cat";
    command.blockchainId = "chain";
    command.walletId = "wallet";
    command.userId = "user";
    command.tokenId = "tokenId";

    const wallet = new UserWalletView();
    wallet.id = new ObjectId().toHexString();
    const blockchain = new Blockchain();
    blockchain.id = new ObjectId().toHexString();
    const category = new Category();
    const confService = new ConfigService();
    const solanaActionsService = new SolanaActionsService(
        new AwsService(confService),
        confService,
        new MetaplexService(confService),
        new HttpService(),
        categoryRepo,
        new MetadataValidator()
    );

    const newNft = Nft.create("nftId", command.userId, command.blockchainId, command.categoryId, command.walletId);

    const transactions: BlockchainNftTransactionsResponse[] = [
        {
            transactionId: "testTransaction"
        }
    ];

    const categorySpy = jest.spyOn(categoryRepo, "findById").mockResolvedValue(category);
    const blockchainSpy = jest.spyOn(blockchainRepo, "findById").mockResolvedValue(blockchain);
    const walletSpy = jest.spyOn(userWalletRepo, "findByUserIdAndWalletIdAndChainId").mockResolvedValue(wallet);
    const blockchainActionsRegSpy = jest
        .spyOn(blockchainActionsRegistryService, "getService")
        .mockResolvedValue(solanaActionsService);

    const solanaActionsServiceSpy = jest
        .spyOn(solanaActionsService, "fetchNftTransactions")
        .mockResolvedValue(transactions);

    const factorySpy = jest.spyOn(nftFactory, "createExternal").mockReturnValue(newNft);

    const nftCommitSpy = jest.spyOn(Nft.prototype, "commit").mockResolvedValue(newNft);

    const returned = await executor.execute(command);

    expect(categorySpy).toHaveBeenCalledTimes(1);
    expect(categorySpy).toHaveBeenCalledWith("cat");

    expect(blockchainSpy).toHaveBeenCalledTimes(1);
    expect(blockchainSpy).toHaveBeenCalledWith("chain");

    expect(walletSpy).toHaveBeenCalledTimes(1);
    expect(walletSpy).toHaveBeenCalledWith("user", "wallet", "chain");

    expect(factorySpy).toHaveBeenCalledTimes(1);
    expect(factorySpy).toHaveBeenCalledWith("user", {
        blockchainId: "chain",
        categoryId: "cat",
        tokenAddress: undefined,
        tokenId: "tokenId",
        transactionId: "testTransaction",
        userWalletId: wallet.id
    });

    expect(blockchainActionsRegSpy).toHaveBeenCalledTimes(1);

    expect(solanaActionsServiceSpy).toHaveBeenCalledTimes(1);

    expect(nftCommitSpy).toHaveBeenCalledTimes(1);

    const expected = new NftDto(newNft.metadataUri, newNft.id);
    expect(returned.id).toBe(expected.id);
    expect(returned.metadataUri).toBe(expected.metadataUri);
});
