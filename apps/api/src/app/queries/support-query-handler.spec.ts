import { SupportQueryHandler } from "./support-query-handler";
import { CategoryRepository } from "../support/categories/category-repository";
import { Category } from "../support/categories/category";
import { ObjectId } from "mongodb";
import { CategoryDto } from "@swan/dto";
import { getUnitTestingModule } from "../test-utils/test-modules";
import { EvmContractsRepository } from "../support/evm-contracts/evm-contracts-repository";
import { EvmContractType } from "../support/evm-contracts/evm-contract-type";
import { buildBlockchain, buildBlockchainWallet, buildEvmContract, buildWallet } from "../test-utils/test-builders";
import { BlockchainWalletRepository } from "../support/blockchains/blockchain-wallet-repository";
import { BlockchainRepository } from "../support/blockchains/blockchain-repository";
import { WalletRepository } from "../support/blockchains/wallet-repository";

let categoryRepository: CategoryRepository;
let evmContractsRepository: EvmContractsRepository;
let handler: SupportQueryHandler;
let blockchainWalletRepository: BlockchainWalletRepository;
let blockchainRepository: BlockchainRepository;
let walletRepository: WalletRepository;

beforeEach(async () => {
    const testModule = await getUnitTestingModule(SupportQueryHandler);

    handler = testModule.get(SupportQueryHandler);
    categoryRepository = testModule.get(CategoryRepository);
    evmContractsRepository = testModule.get(EvmContractsRepository);
    walletRepository = testModule.get(WalletRepository);
    blockchainRepository = testModule.get(BlockchainRepository);
    blockchainWalletRepository = testModule.get(BlockchainWalletRepository);
});

test("getBlockchainWallets - returns empty array for no blockchains", async () => {
    const walletSpy = jest.spyOn(walletRepository, "findAll").mockResolvedValue([]);
    const blockchainSpy = jest.spyOn(blockchainRepository, "findAll").mockResolvedValue([]);
    const blockchainWalletSpy = jest.spyOn(blockchainWalletRepository, "findAll").mockResolvedValue([]);

    const result = await handler.getBlockchainWallets();
    expect(result.length).toBe(0);

    expect(walletSpy).toHaveBeenCalledTimes(1);
    expect(blockchainSpy).toHaveBeenCalledTimes(1);
    expect(blockchainWalletSpy).toHaveBeenCalledTimes(1);
});

test("getBlockchainWallets - skips blockchain wallets that dont match a blockchain", async () => {
    const blockchains = [buildBlockchain(), buildBlockchain()];
    const wallets = [buildWallet(), buildWallet(), buildWallet(), buildWallet()];
    const blockchainWallets = [
        buildBlockchainWallet(),
        buildBlockchainWallet(),
        buildBlockchainWallet(),
        buildBlockchainWallet()
    ];
    blockchainWallets[0].blockchainId = blockchains[0].id;
    blockchainWallets[0].walletId = wallets[0].id;
    blockchainWallets[1].blockchainId = blockchains[0].id;
    blockchainWallets[1].walletId = wallets[1].id;
    blockchainWallets[2].blockchainId = blockchains[1].id;
    blockchainWallets[2].walletId = wallets[2].id;
    blockchainWallets[3].walletId = wallets[3].id;

    const walletSpy = jest.spyOn(walletRepository, "findAll").mockResolvedValue(wallets);
    const blockchainSpy = jest.spyOn(blockchainRepository, "findAll").mockResolvedValue(blockchains);
    const blockchainWalletSpy = jest.spyOn(blockchainWalletRepository, "findAll").mockResolvedValue(blockchainWallets);

    const result = await handler.getBlockchainWallets();
    expect(result.length).toBe(2);
    expect(result[0].rpcUrl).toBe(blockchains[0].rpcUrl);
    expect(result[0].mainTokenName).toBe(blockchains[0].mainTokenName);
    expect(result[0].mainTokenSymbol).toBe(blockchains[0].mainTokenSymbol);
    expect(result[0].isTestNetwork).toBe(blockchains[0].isTestNetwork);
    expect(result[0].scanSiteUrl).toBe(blockchains[0].scanSiteUrl);
    expect(result[0].blockchain.id).toBe(blockchains[0].id);
    expect(result[0].blockchain.name).toBe(blockchains[0].name);
    expect(result[0].blockchain.chainId).toBe(blockchains[0].chainIdHex);
    expect(result[0].wallets.length).toBe(2);
    expect(result[0].wallets[0]?.id).toBe(wallets[0].id);
    expect(result[0].wallets[0]?.name).toBe(wallets[0].name);
    expect(result[0].wallets[0]?.chainId).toBe(blockchains[0].id);
    expect(result[0].wallets[1]?.id).toBe(wallets[1].id);
    expect(result[0].wallets[1]?.name).toBe(wallets[1].name);
    expect(result[0].wallets[1]?.chainId).toBe(blockchains[0].id);

    expect(result[1].rpcUrl).toBe(blockchains[1].rpcUrl);
    expect(result[1].mainTokenName).toBe(blockchains[1].mainTokenName);
    expect(result[1].mainTokenSymbol).toBe(blockchains[1].mainTokenSymbol);
    expect(result[1].isTestNetwork).toBe(blockchains[1].isTestNetwork);
    expect(result[1].scanSiteUrl).toBe(blockchains[1].scanSiteUrl);
    expect(result[1].blockchain.id).toBe(blockchains[1].id);
    expect(result[1].blockchain.name).toBe(blockchains[1].name);
    expect(result[1].blockchain.chainId).toBe(blockchains[1].chainIdHex);
    expect(result[1].wallets.length).toBe(1);
    expect(result[1].wallets[0]?.id).toBe(wallets[2].id);
    expect(result[1].wallets[0]?.name).toBe(wallets[2].name);
    expect(result[1].wallets[0]?.chainId).toBe(blockchains[1].id);

    expect(walletSpy).toHaveBeenCalledTimes(1);
    expect(blockchainSpy).toHaveBeenCalledTimes(1);
    expect(blockchainWalletSpy).toHaveBeenCalledTimes(1);
});

test("getBlockchainWallets - skips blockchain wallets that dont match a wallet", async () => {
    const blockchains = [buildBlockchain(), buildBlockchain()];
    const wallets = [buildWallet(), buildWallet(), buildWallet()];
    const blockchainWallets = [
        buildBlockchainWallet(),
        buildBlockchainWallet(),
        buildBlockchainWallet(),
        buildBlockchainWallet()
    ];
    blockchainWallets[0].blockchainId = blockchains[0].id;
    blockchainWallets[0].walletId = wallets[0].id;
    blockchainWallets[1].blockchainId = blockchains[0].id;
    blockchainWallets[1].walletId = wallets[1].id;
    blockchainWallets[2].blockchainId = blockchains[1].id;
    blockchainWallets[2].walletId = wallets[2].id;
    blockchainWallets[3].blockchainId = blockchains[1].id;

    const walletSpy = jest.spyOn(walletRepository, "findAll").mockResolvedValue(wallets);
    const blockchainSpy = jest.spyOn(blockchainRepository, "findAll").mockResolvedValue(blockchains);
    const blockchainWalletSpy = jest.spyOn(blockchainWalletRepository, "findAll").mockResolvedValue(blockchainWallets);

    const result = await handler.getBlockchainWallets();
    expect(result.length).toBe(2);
    expect(result[0].rpcUrl).toBe(blockchains[0].rpcUrl);
    expect(result[0].mainTokenName).toBe(blockchains[0].mainTokenName);
    expect(result[0].mainTokenSymbol).toBe(blockchains[0].mainTokenSymbol);
    expect(result[0].isTestNetwork).toBe(blockchains[0].isTestNetwork);
    expect(result[0].scanSiteUrl).toBe(blockchains[0].scanSiteUrl);
    expect(result[0].blockchain.id).toBe(blockchains[0].id);
    expect(result[0].blockchain.name).toBe(blockchains[0].name);
    expect(result[0].blockchain.chainId).toBe(blockchains[0].chainIdHex);
    expect(result[0].wallets.length).toBe(2);
    expect(result[0].wallets[0]?.id).toBe(wallets[0].id);
    expect(result[0].wallets[0]?.name).toBe(wallets[0].name);
    expect(result[0].wallets[0]?.chainId).toBe(blockchains[0].id);
    expect(result[0].wallets[1]?.id).toBe(wallets[1].id);
    expect(result[0].wallets[1]?.name).toBe(wallets[1].name);
    expect(result[0].wallets[1]?.chainId).toBe(blockchains[0].id);

    expect(result[1].rpcUrl).toBe(blockchains[1].rpcUrl);
    expect(result[1].mainTokenName).toBe(blockchains[1].mainTokenName);
    expect(result[1].mainTokenSymbol).toBe(blockchains[1].mainTokenSymbol);
    expect(result[1].isTestNetwork).toBe(blockchains[1].isTestNetwork);
    expect(result[1].scanSiteUrl).toBe(blockchains[1].scanSiteUrl);
    expect(result[1].blockchain.id).toBe(blockchains[1].id);
    expect(result[1].blockchain.name).toBe(blockchains[1].name);
    expect(result[1].blockchain.chainId).toBe(blockchains[1].chainIdHex);
    expect(result[1].wallets.length).toBe(1);
    expect(result[1].wallets[0]?.id).toBe(wallets[2].id);
    expect(result[1].wallets[0]?.name).toBe(wallets[2].name);
    expect(result[1].wallets[0]?.chainId).toBe(blockchains[1].id);

    expect(walletSpy).toHaveBeenCalledTimes(1);
    expect(blockchainSpy).toHaveBeenCalledTimes(1);
    expect(blockchainWalletSpy).toHaveBeenCalledTimes(1);
});

test("getEvmMarketplaceContracts - returns empty dto array", async () => {
    const repoSpy = jest.spyOn(evmContractsRepository, "findByTypeAndActive").mockResolvedValue([]);

    const result = await handler.getEvmMarketplaceContracts();

    expect(result.length).toBe(0);

    expect(repoSpy).toHaveBeenCalledTimes(1);
    expect(repoSpy).toHaveBeenCalledWith(EvmContractType.MARKETPLACE);
});

test("getEvmMarketplaceContracts - returns mapped dto array", async () => {
    const contracts = [buildEvmContract(), buildEvmContract()];
    const repoSpy = jest.spyOn(evmContractsRepository, "findByTypeAndActive").mockResolvedValue(contracts);

    const result = await handler.getEvmMarketplaceContracts();

    expect(result.length).toBe(2);
    expect(result[0].blockchainId).toBe(contracts[0].blockchainId);
    expect(result[0].deploymentAddress).toBe(contracts[0].deploymentAddress);
    expect(result[0].isTestNetwork).toBe(contracts[0].isTestNetwork);
    expect(result[1].blockchainId).toBe(contracts[1].blockchainId);
    expect(result[1].deploymentAddress).toBe(contracts[1].deploymentAddress);
    expect(result[1].isTestNetwork).toBe(contracts[1].isTestNetwork);

    expect(repoSpy).toHaveBeenCalledTimes(1);
    expect(repoSpy).toHaveBeenCalledWith(EvmContractType.MARKETPLACE);
});

test("getEvmErc721Contracts - returns empty dto array", async () => {
    const repoSpy = jest.spyOn(evmContractsRepository, "findByTypeAndActive").mockResolvedValue([]);

    const result = await handler.getEvmErc721Contracts();

    expect(result.length).toBe(0);

    expect(repoSpy).toHaveBeenCalledTimes(1);
    expect(repoSpy).toHaveBeenCalledWith(EvmContractType.ERC721);
});

test("getEvmErc721Contracts - returns mapped dto array", async () => {
    const contracts = [buildEvmContract(), buildEvmContract()];
    const repoSpy = jest.spyOn(evmContractsRepository, "findByTypeAndActive").mockResolvedValue(contracts);

    const result = await handler.getEvmErc721Contracts();

    expect(result.length).toBe(2);
    expect(result[0].blockchainId).toBe(contracts[0].blockchainId);
    expect(result[0].deploymentAddress).toBe(contracts[0].deploymentAddress);
    expect(result[0].isTestNetwork).toBe(contracts[0].isTestNetwork);
    expect(result[1].blockchainId).toBe(contracts[1].blockchainId);
    expect(result[1].deploymentAddress).toBe(contracts[1].deploymentAddress);
    expect(result[1].isTestNetwork).toBe(contracts[1].isTestNetwork);

    expect(repoSpy).toHaveBeenCalledTimes(1);
    expect(repoSpy).toHaveBeenCalledWith(EvmContractType.ERC721);
});

test("getCategories - returns empty dto array", async () => {
    const repoSpy = jest.spyOn(categoryRepository, "findAll").mockResolvedValue([]);

    const result = await handler.getCategories();

    expect(result.length).toBe(0);

    expect(repoSpy).toHaveBeenCalledTimes(1);
});

test("getCategories - returns mapped dto array", async () => {
    const views = [new Category(), new Category()];

    views[0]._id = new ObjectId();
    views[0].name = "one";
    views[0].imageUrl = "one-url";

    views[1]._id = new ObjectId();
    views[1].name = "two";
    views[1].imageUrl = "two-url";
    const repoSpy = jest.spyOn(categoryRepository, "findAll").mockResolvedValue(views);

    const result = await handler.getCategories();

    expect(result.length).toBe(2);
    expect(result[0]).toEqual(new CategoryDto(views[0].name, views[0].id, views[0].imageUrl));
    expect(result[1]).toEqual(new CategoryDto(views[1].name, views[1].id, views[1].imageUrl));

    expect(repoSpy).toHaveBeenCalledTimes(1);
});
