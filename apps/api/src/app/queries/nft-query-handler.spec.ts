import { getUnitTestingModule } from "../test-utils/test-modules";
import { NftQueryHandler } from "./nft-query-handler";
import { UserWalletViewRepository } from "../views/user-wallet/user-wallet-view-repository";
import { BlockchainRepository } from "../support/blockchains/blockchain-repository";
import { CategoryRepository } from "../support/categories/category-repository";
import { NftViewRepository } from "../views/nft/nft-view-repository";
import { CollectionViewRepository } from "../views/collection/collection-view-repository";
import { buildBlockchain, buildNftView, buildUserWalletView } from "../test-utils/test-builders";
import { Category } from "../support/categories/category";
import { ObjectId } from "mongodb";

let handler: NftQueryHandler;
let userWalletRepository: UserWalletViewRepository;
let blockchainRepository: BlockchainRepository;
let categoryRepository: CategoryRepository;
let nftViewRepository: NftViewRepository;
let collectionRepository: CollectionViewRepository;

beforeEach(async () => {
    const testModule = await getUnitTestingModule(NftQueryHandler);

    handler = testModule.get(NftQueryHandler);
    userWalletRepository = testModule.get(UserWalletViewRepository);
    blockchainRepository = testModule.get(BlockchainRepository);
    categoryRepository = testModule.get(CategoryRepository);
    nftViewRepository = testModule.get(NftViewRepository);
    collectionRepository = testModule.get(CollectionViewRepository);
});

test("getByUserId - returns empty array for no views", async () => {
    const nftFindSpy = jest.spyOn(nftViewRepository, "findByUserId").mockResolvedValue([]);

    const nfts = await handler.getByUserId("the-user");
    expect(nfts.length).toBe(0);

    expect(nftFindSpy).toHaveBeenCalledTimes(1);
    expect(nftFindSpy).toHaveBeenCalledWith("the-user");
});

test("getByUserId - skips nfts with no matching category", async () => {
    const nftViews = [buildNftView(), buildNftView(), buildNftView()];
    const cat1 = new Category();
    cat1._id = new ObjectId();

    const categorySpy = jest.spyOn(categoryRepository, "findAll").mockResolvedValue([cat1]);
    const nftFindSpy = jest.spyOn(nftViewRepository, "findByUserId").mockResolvedValue(nftViews);

    const nfts = await handler.getByUserId("the-user");
    expect(nfts.length).toBe(0);

    expect(nftFindSpy).toHaveBeenCalledTimes(1);
    expect(nftFindSpy).toHaveBeenCalledWith("the-user");
    expect(categorySpy).toHaveBeenCalledTimes(1);
});

test("getByUserId - skips nfts with no matching blockchain", async () => {
    const nftViews = [buildNftView(), buildNftView()];
    const cat1 = new Category();
    cat1.id = nftViews[0].categoryId;
    const cat2 = new Category();
    cat2.id = nftViews[1].categoryId;

    const categorySpy = jest.spyOn(categoryRepository, "findAll").mockResolvedValue([cat1, cat2]);
    const nftFindSpy = jest.spyOn(nftViewRepository, "findByUserId").mockResolvedValue(nftViews);
    const blockchainSpy = jest.spyOn(blockchainRepository, "findAll").mockResolvedValue([]);

    const nfts = await handler.getByUserId("the-user");
    expect(nfts.length).toBe(0);

    expect(nftFindSpy).toHaveBeenCalledTimes(1);
    expect(blockchainSpy).toHaveBeenCalledTimes(1);
    expect(nftFindSpy).toHaveBeenCalledWith("the-user");
    expect(categorySpy).toHaveBeenCalledTimes(1);
});

test("getByUserId - returns nfts with no matching collection", async () => {
    const walletViews = [buildUserWalletView()];
    const nftViews = [buildNftView(), buildNftView()];
    nftViews[0].userWalletId = walletViews[0].id;
    nftViews[1].userWalletId = walletViews[0].id;
    const cat1 = new Category();
    cat1.id = nftViews[0].categoryId;
    const cat2 = new Category();
    cat2.id = nftViews[1].categoryId;
    const blockchains = [buildBlockchain(), buildBlockchain()];
    blockchains[0].id = nftViews[0].blockchainId;
    blockchains[1].id = nftViews[1].blockchainId;

    const walletsSpy = jest.spyOn(userWalletRepository, "findByIds").mockResolvedValue(walletViews);
    const categorySpy = jest.spyOn(categoryRepository, "findAll").mockResolvedValue([cat1, cat2]);
    const nftFindSpy = jest.spyOn(nftViewRepository, "findByUserId").mockResolvedValue(nftViews);
    const blockchainSpy = jest.spyOn(blockchainRepository, "findAll").mockResolvedValue(blockchains);

    const nfts = await handler.getByUserId("the-user");
    expect(nfts.length).toBe(2);
    expect(nfts[0].id).toBe(nftViews[0].id);
    expect(nfts[0].nftAddress).toBe(nftViews[0].nftAddress);
    expect(nfts[0].tokenContractAddress).toBe(nftViews[0].tokenContractAddress);
    expect(nfts[0].metadataUri).toBe(nftViews[0].metadataUri);
    expect(nfts[0].imageUri).toBe(nftViews[0].fileUri);
    expect(nfts[0].walletId).toBe(walletViews[0].walletId);
    expect(nfts[0].blockchain.id).toBe(nftViews[0].blockchainId);
    expect(nfts[0].blockchain.name).toBe(blockchains[0].name);
    expect(nfts[0].blockchain.chainId).toBe(blockchains[0].chainIdHex);
    expect(nfts[0].category.name).toBe(cat1.name);
    expect(nfts[0].category.id).toBe(cat1.id);
    expect(nfts[0].category.imageUrl).toBe(cat1.imageUrl);

    expect(nfts[1].id).toBe(nftViews[1].id);
    expect(nfts[1].nftAddress).toBe(nftViews[1].nftAddress);
    expect(nfts[1].tokenContractAddress).toBe(nftViews[1].tokenContractAddress);
    expect(nfts[1].metadataUri).toBe(nftViews[1].metadataUri);
    expect(nfts[1].imageUri).toBe(nftViews[1].fileUri);
    expect(nfts[1].walletId).toBe(walletViews[0].walletId);
    expect(nfts[1].blockchain.id).toBe(nftViews[1].blockchainId);
    expect(nfts[1].blockchain.name).toBe(blockchains[1].name);
    expect(nfts[1].blockchain.chainId).toBe(blockchains[1].chainIdHex);
    expect(nfts[1].category.name).toBe(cat2.name);
    expect(nfts[1].category.id).toBe(cat2.id);
    expect(nfts[1].category.imageUrl).toBe(cat2.imageUrl);

    expect(nftFindSpy).toHaveBeenCalledTimes(1);
    expect(blockchainSpy).toHaveBeenCalledTimes(1);
    expect(nftFindSpy).toHaveBeenCalledWith("the-user");
    expect(categorySpy).toHaveBeenCalledTimes(1);
    expect(walletsSpy).toHaveBeenCalledTimes(1);
    expect(walletsSpy).toHaveBeenCalledWith([walletViews[0].id]);
});
