import { ListingFactory } from "../../domain/listing/listing-factory";
import { CategoryRepository } from "../../support/categories/category-repository";
import { BlockchainRepository } from "../../support/blockchains/blockchain-repository";
import { NftViewRepository } from "../../views/nft/nft-view-repository";
import { CreateListingCommandExecutor } from "./create-listing-command-executor";
import { getUnitTestingModule } from "../../test-utils/test-modules";
import { CreateListingCommand } from "./create-listing-command";

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

test("execute - throws when category is not found", async () => {});

test("execute - throws when blockchain is not found", async () => {});

test("execute - throws when nft id is set and not found", async () => {});

test("execute - throws when blockchain id doesn't match nft blockchain", async () => {
    const command = new CreateListingCommand();
    command.nftId = "nft";
    command.categoryId = "cat";
    command.userId = "the-user";
    command.blockchainId = "block";
    command.chainTokenId = "tok";
    command.tokenContractAddress = "address";
    command.price = 4;
});
