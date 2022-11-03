import { getUnitTestingModule } from "../test-utils/test-modules";
import { CancelEvmListingsJob } from "./cancel-evm-listings-job";
import { ListingViewRepository } from "../views/listing/listing-view-repository";
import { ListingFactory } from "../domain/listing/listing-factory";
import { EventStore } from "../infrastructure/event-store";
import { ConfigService } from "@nestjs/config";
import { buildBlockchain, buildEvmContract, buildListingView } from "../test-utils/test-builders";
import { ListingFilters } from "./listing-filters";
import { Listing } from "../domain/listing/listing";
import { createMock } from "@golevelup/ts-jest";
import { SourcedEvent } from "../infrastructure/sourced-event";

let job: CancelEvmListingsJob;
let listingFilters: ListingFilters;
let listingsRepo: ListingViewRepository;
let listingFactory: ListingFactory;
let store: EventStore;
let configService: ConfigService;

beforeEach(async () => {
    const testModule = await getUnitTestingModule(CancelEvmListingsJob);

    job = testModule.get(CancelEvmListingsJob);
    listingFilters = testModule.get(ListingFilters);
    listingsRepo = testModule.get(ListingViewRepository);
    listingFactory = testModule.get(ListingFactory);
    store = testModule.get(EventStore);
    configService = testModule.get(ConfigService);
});

test("confirmApprovalsAndOwners - can cancel listings from multiple data pages", (endTest) => {
    const configSpy = jest.spyOn(configService, "getOrThrow").mockReturnValue(2);

    const chains = [buildBlockchain(), buildBlockchain()];
    const contracts = [buildEvmContract(), buildEvmContract()];
    contracts[0].blockchainId = chains[0].id;
    contracts[1].blockchainId = chains[1].id;

    const listings = [
        buildListingView(),
        buildListingView(),
        buildListingView(),
        buildListingView(),
        buildListingView()
    ];

    listings[0].blockchainId = chains[0].id;
    listings[1].blockchainId = chains[0].id; //invalid
    listings[2].blockchainId = chains[0].id; //invalid
    listings[3].blockchainId = chains[1].id;
    listings[4].blockchainId = chains[1].id; //invalid
    const pageSpy = jest
        .spyOn(listingsRepo, "findAllActive")
        .mockResolvedValueOnce([[listings[0], listings[1]], 5])
        .mockResolvedValueOnce([[listings[2], listings[3]], 3])
        .mockResolvedValueOnce([[listings[4]], 1]);

    const filterSpy = jest
        .spyOn(listingFilters, "filterForInvalidUsingContract")
        .mockResolvedValueOnce([listings[1]])
        .mockResolvedValueOnce([listings[2]])
        .mockResolvedValueOnce([listings[4]]);

    const entity1Events = [new SourcedEvent(listings[1].id)];
    const entity2Events = [new SourcedEvent(listings[2].id)];
    const entity4Events = [new SourcedEvent(listings[4].id)];

    const findEventsSpy = jest
        .spyOn(store, "findEventsByAggregateIds")
        .mockResolvedValueOnce(entity1Events)
        .mockResolvedValueOnce(entity2Events)
        .mockResolvedValueOnce(entity4Events);

    const listingEntity1 = createMock<Listing>();
    const listingEntity2 = createMock<Listing>();
    const listingEntity3 = createMock<Listing>();

    const commitSpy1 = jest.spyOn(listingEntity1, "commit").mockResolvedValue(listingEntity1);
    const commitSpy2 = jest.spyOn(listingEntity2, "commit").mockResolvedValue(listingEntity2);
    const commitSpy3 = jest.spyOn(listingEntity3, "commit").mockResolvedValue(listingEntity3);

    const cancelSpy1 = jest.spyOn(listingEntity1, "cancel").mockImplementation(() => {});
    const cancelSpy2 = jest.spyOn(listingEntity2, "cancel").mockImplementation(() => {});
    const cancelSpy3 = jest.spyOn(listingEntity3, "cancel").mockImplementation(() => {});

    const factorySpy = jest
        .spyOn(listingFactory, "createFromEvents")
        .mockReturnValueOnce(listingEntity1)
        .mockReturnValueOnce(listingEntity2)
        .mockReturnValueOnce(listingEntity3);

    job.confirmApprovalsAndOwners();
    setTimeout(() => {
        expect(configSpy).toHaveBeenCalledTimes(1);
        expect(configSpy).toHaveBeenCalledWith("JOB_PAGE_SIZE");
        expect(pageSpy).toHaveBeenCalledTimes(3);
        expect(pageSpy).toHaveBeenNthCalledWith(1, 0, 2);
        expect(pageSpy).toHaveBeenNthCalledWith(2, 2, 2);
        expect(pageSpy).toHaveBeenNthCalledWith(3, 4, 2);
        expect(filterSpy).toHaveBeenCalledTimes(3);
        expect(filterSpy).toHaveBeenNthCalledWith(1, [listings[0], listings[1]]);
        expect(filterSpy).toHaveBeenNthCalledWith(2, [listings[2], listings[3]]);
        expect(filterSpy).toHaveBeenNthCalledWith(3, [listings[4]]);
        expect(findEventsSpy).toHaveBeenCalledTimes(3);
        expect(findEventsSpy).toHaveBeenNthCalledWith(1, [listings[1].id]);
        expect(findEventsSpy).toHaveBeenNthCalledWith(2, [listings[2].id]);
        expect(findEventsSpy).toHaveBeenNthCalledWith(3, [listings[4].id]);
        expect(factorySpy).toHaveBeenCalledTimes(3);
        expect(factorySpy).toHaveBeenNthCalledWith(1, listings[1].id, entity1Events);
        expect(factorySpy).toHaveBeenNthCalledWith(2, listings[2].id, entity2Events);
        expect(factorySpy).toHaveBeenNthCalledWith(3, listings[4].id, entity4Events);
        expect(commitSpy1).toHaveBeenCalledTimes(1);
        expect(commitSpy2).toHaveBeenCalledTimes(1);
        expect(commitSpy3).toHaveBeenCalledTimes(1);
        expect(cancelSpy1).toHaveBeenCalledTimes(1);
        expect(cancelSpy2).toHaveBeenCalledTimes(1);
        expect(cancelSpy3).toHaveBeenCalledTimes(1);
        expect(cancelSpy1).toHaveBeenCalledWith(true);
        expect(cancelSpy2).toHaveBeenCalledWith(true);
        expect(cancelSpy3).toHaveBeenCalledWith(true);

        endTest();
    }, 2000);
});

test("confirmApprovalsAndOwners - can cancel listings from one page", (endTest) => {
    const configSpy = jest.spyOn(configService, "getOrThrow").mockReturnValue(6);

    const chains = [buildBlockchain(), buildBlockchain()];
    const contracts = [buildEvmContract(), buildEvmContract()];
    contracts[0].blockchainId = chains[0].id;
    contracts[1].blockchainId = chains[1].id;

    const listings = [
        buildListingView(),
        buildListingView(),
        buildListingView(),
        buildListingView(),
        buildListingView()
    ];

    listings[0].blockchainId = chains[0].id;
    listings[1].blockchainId = chains[0].id; //invalid
    listings[2].blockchainId = chains[0].id; //invalid
    listings[3].blockchainId = chains[1].id;
    listings[4].blockchainId = chains[1].id; //invalid
    const pageSpy = jest.spyOn(listingsRepo, "findAllActive").mockResolvedValueOnce([listings, 5]);

    const filterSpy = jest
        .spyOn(listingFilters, "filterForInvalidUsingContract")
        .mockResolvedValueOnce([listings[1], listings[2], listings[4]]);

    const entity1Events = [new SourcedEvent(listings[1].id)];
    const entity2Events = [new SourcedEvent(listings[2].id)];
    const entity4Events = [new SourcedEvent(listings[4].id)];

    const findEventsSpy = jest
        .spyOn(store, "findEventsByAggregateIds")
        .mockResolvedValue(entity1Events.concat(entity2Events).concat(entity4Events));

    const listingEntity1 = createMock<Listing>();
    const listingEntity2 = createMock<Listing>();
    const listingEntity3 = createMock<Listing>();

    const commitSpy1 = jest.spyOn(listingEntity1, "commit").mockResolvedValue(listingEntity1);
    const commitSpy2 = jest.spyOn(listingEntity2, "commit").mockResolvedValue(listingEntity2);
    const commitSpy3 = jest.spyOn(listingEntity3, "commit").mockResolvedValue(listingEntity3);

    const cancelSpy1 = jest.spyOn(listingEntity1, "cancel").mockImplementation(() => {});
    const cancelSpy2 = jest.spyOn(listingEntity2, "cancel").mockImplementation(() => {});
    const cancelSpy3 = jest.spyOn(listingEntity3, "cancel").mockImplementation(() => {});

    const factorySpy = jest
        .spyOn(listingFactory, "createFromEvents")
        .mockReturnValueOnce(listingEntity1)
        .mockReturnValueOnce(listingEntity2)
        .mockReturnValueOnce(listingEntity3);

    job.confirmApprovalsAndOwners();
    setTimeout(() => {
        expect(configSpy).toHaveBeenCalledTimes(1);
        expect(configSpy).toHaveBeenCalledWith("JOB_PAGE_SIZE");
        expect(pageSpy).toHaveBeenCalledTimes(1);
        expect(pageSpy).toHaveBeenNthCalledWith(1, 0, 6);
        expect(filterSpy).toHaveBeenCalledTimes(1);
        expect(filterSpy).toHaveBeenNthCalledWith(1, listings);
        expect(findEventsSpy).toHaveBeenCalledTimes(1);
        expect(findEventsSpy).toHaveBeenCalledWith([listings[1].id, listings[2].id, listings[4].id]);
        expect(factorySpy).toHaveBeenCalledTimes(3);
        expect(factorySpy).toHaveBeenNthCalledWith(1, listings[1].id, entity1Events);
        expect(factorySpy).toHaveBeenNthCalledWith(2, listings[2].id, entity2Events);
        expect(factorySpy).toHaveBeenNthCalledWith(3, listings[4].id, entity4Events);
        expect(commitSpy1).toHaveBeenCalledTimes(1);
        expect(commitSpy2).toHaveBeenCalledTimes(1);
        expect(commitSpy3).toHaveBeenCalledTimes(1);
        expect(cancelSpy1).toHaveBeenCalledTimes(1);
        expect(cancelSpy2).toHaveBeenCalledTimes(1);
        expect(cancelSpy3).toHaveBeenCalledTimes(1);
        expect(cancelSpy1).toHaveBeenCalledWith(true);
        expect(cancelSpy2).toHaveBeenCalledWith(true);
        expect(cancelSpy3).toHaveBeenCalledWith(true);

        endTest();
    }, 2000);
});

test("confirmApprovalsAndOwners - cancels nothing if nothing is invalid", (endTest) => {
    const configSpy = jest.spyOn(configService, "getOrThrow").mockReturnValue(2);

    const chains = [buildBlockchain(), buildBlockchain()];
    const contracts = [buildEvmContract(), buildEvmContract()];
    contracts[0].blockchainId = chains[0].id;
    contracts[1].blockchainId = chains[1].id;

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

    const filterSpy = jest.spyOn(listingFilters, "filterForInvalidUsingContract").mockResolvedValue([]);
    const findEventsSpy = jest.spyOn(store, "findEventsByAggregateIds").mockResolvedValue([]);

    job.confirmApprovalsAndOwners();
    setTimeout(() => {
        expect(configSpy).toHaveBeenCalledTimes(1);
        expect(configSpy).toHaveBeenCalledWith("JOB_PAGE_SIZE");
        expect(pageSpy).toHaveBeenCalledTimes(3);
        expect(pageSpy).toHaveBeenNthCalledWith(1, 0, 2);
        expect(pageSpy).toHaveBeenNthCalledWith(2, 2, 2);
        expect(pageSpy).toHaveBeenNthCalledWith(3, 4, 2);
        expect(filterSpy).toHaveBeenCalledTimes(3);
        expect(filterSpy).toHaveBeenNthCalledWith(1, [listings[0], listings[1]]);
        expect(filterSpy).toHaveBeenNthCalledWith(2, [listings[2], listings[3]]);
        expect(filterSpy).toHaveBeenNthCalledWith(3, [listings[4]]);
        expect(findEventsSpy).toHaveBeenCalledTimes(0);
        endTest();
    }, 2000);
});
