import { getUnitTestingModule } from "../test-utils/test-modules";
import { CancelEvmListingsJob } from "./cancel-evm-listings-job";
import { ListingViewRepository } from "../views/listing/listing-view-repository";
import { ListingFactory } from "../domain/listing/listing-factory";
import { ContractFactory } from "@swan/contracts";
import { EvmContractsRepository } from "../support/evm-contracts/evm-contracts-repository";
import { EventStore } from "../infrastructure/event-store";
import { ConfigService } from "@nestjs/config";
import { BlockchainRepository } from "../support/blockchains/blockchain-repository";
import { buildBlockchain, buildEvmContract, buildListingView } from "../test-utils/test-builders";
import { EvmContractType } from "../support/evm-contracts/evm-contract-type";

let job: CancelEvmListingsJob;
let listingsRepo: ListingViewRepository;
let listingFactory: ListingFactory;
let contractFactory: ContractFactory;
let contactsRepo: EvmContractsRepository;
let store: EventStore;
let configService: ConfigService;
let blockchainRepo: BlockchainRepository;

beforeEach(async () => {
    const testModule = await getUnitTestingModule(CancelEvmListingsJob);

    job = testModule.get(CancelEvmListingsJob);
    listingsRepo = testModule.get(ListingViewRepository);
    listingFactory = testModule.get(ListingFactory);
    contractFactory = testModule.get(ContractFactory);
    contactsRepo = testModule.get(EvmContractsRepository);
    store = testModule.get(EventStore);
    configService = testModule.get(ConfigService);
    blockchainRepo = testModule.get(BlockchainRepository);
});

test("confirmApprovalsAndOwners - can cancel listings from multiple data pages", async () => {
    const configSpy = jest.spyOn(configService, "getOrThrow").mockReturnValue(2);

    const chains = [buildBlockchain(), buildBlockchain()];
    const contracts = [buildEvmContract(), buildEvmContract()];
    contracts[0].blockchainId = chains[0].id;
    contracts[1].blockchainId = chains[1].id;
    const blockchainsSpy = jest.spyOn(blockchainRepo, "findAll").mockResolvedValue(chains);
    const contractsSpy = jest.spyOn(contactsRepo, "findByTypeAndActive").mockResolvedValue(contracts);

    const listings = [
        buildListingView(),
        buildListingView(),
        buildListingView(),
        buildListingView(),
        buildListingView()
    ];

    listings[0].blockchainId = chains[0].id;
    listings[1].blockchainId = chains[0].id;
    listings[2].blockchainId = chains[0].id;
    listings[3].blockchainId = chains[1].id;
    listings[4].blockchainId = chains[1].id;
    const pageSpy = jest
        .spyOn(listingsRepo, "findAllActive")
        .mockResolvedValueOnce([[listings[0], listings[1]], 5])
        .mockResolvedValueOnce([[listings[2], listings[3]], 3])
        .mockResolvedValueOnce([[listings[4]], 1]);

    expect(configSpy).toHaveBeenCalledTimes(1);
    expect(configSpy).toHaveBeenCalledWith("JOB_PAGE_SIZE");
    expect(blockchainsSpy).toHaveBeenCalledTimes(1);
    expect(contractsSpy).toHaveBeenCalledTimes(1);
    expect(contractsSpy).toHaveBeenCalledWith(EvmContractType.MARKETPLACE);
    expect(pageSpy).toHaveBeenCalledTimes(3);
    expect(pageSpy).toHaveBeenNthCalledWith(1, 0, 2);
    expect(pageSpy).toHaveBeenNthCalledWith(2, 2, 2);
    expect(pageSpy).toHaveBeenNthCalledWith(3, 4, 2);
});
