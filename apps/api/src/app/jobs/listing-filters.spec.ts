import { ListingFilters } from "./listing-filters";
import { ContractFactory, SwanMarketplaceContract } from "@swan/contracts";
import { EvmContractsRepository } from "../support/evm-contracts/evm-contracts-repository";
import { BlockchainRepository } from "../support/blockchains/blockchain-repository";
import { getUnitTestingModule } from "../test-utils/test-modules";
import { buildBlockchain, buildEvmContract, buildListingView } from "../test-utils/test-builders";
import { EvmContractType } from "../support/evm-contracts/evm-contract-type";
import { createMock } from "@golevelup/ts-jest";
import { ethers } from "ethers";

let listingFilters: ListingFilters;
let contractFactory: ContractFactory;
let contactsRepo: EvmContractsRepository;
let blockchainRepo: BlockchainRepository;

beforeEach(async () => {
    const testModule = await getUnitTestingModule(ListingFilters);

    listingFilters = testModule.get(ListingFilters);
    contractFactory = testModule.get(ContractFactory);
    contactsRepo = testModule.get(EvmContractsRepository);
    blockchainRepo = testModule.get(BlockchainRepository);
});

test("filterForInvalidUsingContract - return empty array if all listings are valid", async () => {
    const chains = [buildBlockchain(), buildBlockchain()];
    const contracts = [buildEvmContract(), buildEvmContract()];
    contracts[0].blockchainId = chains[0].id;
    contracts[1].blockchainId = chains[1].id;
    const blockchainsSpy = jest.spyOn(blockchainRepo, "findAll").mockResolvedValue(chains);
    const contractsSpy = jest.spyOn(contactsRepo, "findByTypeAndActive").mockResolvedValue(contracts);

    const listings = [buildListingView(), buildListingView(), buildListingView(), buildListingView()];

    listings[0].blockchainId = chains[0].id;
    listings[1].blockchainId = chains[0].id;
    listings[2].blockchainId = chains[0].id;
    listings[3].blockchainId = chains[1].id;

    const contract = createMock<SwanMarketplaceContract>();
    const contractFactorySpy = jest.spyOn(contractFactory, "createMarketplace").mockReturnValue(contract);
    const filterInvalidSpy = jest.spyOn(contract, "filterForInvalid").mockResolvedValue([]);

    const invalid = await listingFilters.filterForInvalidUsingContract(listings);
    expect(invalid.length).toBe(0);

    expect(blockchainsSpy).toHaveBeenCalledTimes(1);
    expect(contractsSpy).toHaveBeenCalledTimes(1);
    expect(contractsSpy).toHaveBeenCalledWith(EvmContractType.MARKETPLACE);
    expect(contractFactorySpy).toHaveBeenCalledTimes(2);
    expect(contractFactorySpy).toHaveBeenNthCalledWith(
        1,
        new ethers.providers.JsonRpcProvider(chains[0].rpcUrl),
        contracts[0].deploymentAddress
    );
    expect(contractFactorySpy).toHaveBeenNthCalledWith(
        2,
        new ethers.providers.JsonRpcProvider(chains[1].rpcUrl),
        contracts[1].deploymentAddress
    );
    expect(filterInvalidSpy).toHaveBeenCalledTimes(2);
    expect(filterInvalidSpy).toHaveBeenNthCalledWith(
        1,
        [listings[0], listings[1], listings[2]].map((listing) => ({
            seller: listing.sellerAddress,
            price: listing.price,
            listingId: parseInt(listing.chainListingId),
            tokenId: listing.chainTokenId,
            tokenContractAddress: listing.tokenContractAddress
        }))
    );
    expect(filterInvalidSpy).toHaveBeenNthCalledWith(
        2,
        [listings[3]].map((listing) => ({
            seller: listing.sellerAddress,
            price: listing.price,
            listingId: parseInt(listing.chainListingId),
            tokenId: listing.chainTokenId,
            tokenContractAddress: listing.tokenContractAddress
        }))
    );
});

test("filterForInvalidUsingContract - return invalids array from multiple chains", async () => {
    const chains = [buildBlockchain(), buildBlockchain()];
    const contracts = [buildEvmContract(), buildEvmContract()];
    contracts[0].blockchainId = chains[0].id;
    contracts[1].blockchainId = chains[1].id;
    const blockchainsSpy = jest.spyOn(blockchainRepo, "findAll").mockResolvedValue(chains);
    const contractsSpy = jest.spyOn(contactsRepo, "findByTypeAndActive").mockResolvedValue(contracts);

    const listings = [buildListingView(), buildListingView(), buildListingView(), buildListingView()];

    listings[0].blockchainId = chains[0].id; // this will be invalid
    listings[1].blockchainId = chains[0].id;
    listings[2].blockchainId = chains[0].id;
    listings[3].blockchainId = chains[1].id; // this will be invalid

    const contract = createMock<SwanMarketplaceContract>();
    const contractFactorySpy = jest.spyOn(contractFactory, "createMarketplace").mockReturnValue(contract);
    const filterInvalidSpy = jest.spyOn(contract, "filterForInvalid").mockImplementation((toFilter) => {
        return toFilter.length === 1
            ? Promise.resolve([parseInt(listings[3].chainListingId)])
            : Promise.resolve([parseInt(listings[0].chainListingId)]);
    });

    const invalid = await listingFilters.filterForInvalidUsingContract(listings);
    expect(invalid.length).toBe(2);
    expect(invalid[0]).toBe(listings[0]);
    expect(invalid[1]).toBe(listings[3]);

    expect(blockchainsSpy).toHaveBeenCalledTimes(1);
    expect(contractsSpy).toHaveBeenCalledTimes(1);
    expect(contractsSpy).toHaveBeenCalledWith(EvmContractType.MARKETPLACE);
    expect(contractFactorySpy).toHaveBeenCalledTimes(2);
    expect(contractFactorySpy).toHaveBeenNthCalledWith(
        1,
        new ethers.providers.JsonRpcProvider(chains[0].rpcUrl),
        contracts[0].deploymentAddress
    );
    expect(contractFactorySpy).toHaveBeenNthCalledWith(
        2,
        new ethers.providers.JsonRpcProvider(chains[1].rpcUrl),
        contracts[1].deploymentAddress
    );
    expect(filterInvalidSpy).toHaveBeenCalledTimes(2);
    expect(filterInvalidSpy).toHaveBeenNthCalledWith(
        1,
        [listings[0], listings[1], listings[2]].map((listing) => ({
            seller: listing.sellerAddress,
            price: listing.price,
            listingId: parseInt(listing.chainListingId),
            tokenId: listing.chainTokenId,
            tokenContractAddress: listing.tokenContractAddress
        }))
    );
    expect(filterInvalidSpy).toHaveBeenNthCalledWith(
        2,
        [listings[3]].map((listing) => ({
            seller: listing.sellerAddress,
            price: listing.price,
            listingId: parseInt(listing.chainListingId),
            tokenId: listing.chainTokenId,
            tokenContractAddress: listing.tokenContractAddress
        }))
    );
});

test("filterForInvalidUsingContract - return invalids array from one chain", async () => {
    const chains = [buildBlockchain(), buildBlockchain()];
    const contracts = [buildEvmContract(), buildEvmContract()];
    contracts[0].blockchainId = chains[0].id;
    contracts[1].blockchainId = chains[1].id;
    const blockchainsSpy = jest.spyOn(blockchainRepo, "findAll").mockResolvedValue(chains);
    const contractsSpy = jest.spyOn(contactsRepo, "findByTypeAndActive").mockResolvedValue(contracts);

    const listings = [buildListingView(), buildListingView(), buildListingView(), buildListingView()];

    listings[0].blockchainId = chains[0].id;
    listings[1].blockchainId = chains[0].id;
    listings[2].blockchainId = chains[0].id;
    listings[3].blockchainId = chains[1].id; // this will be invalid

    const contract = createMock<SwanMarketplaceContract>();
    const contractFactorySpy = jest.spyOn(contractFactory, "createMarketplace").mockReturnValue(contract);
    const filterInvalidSpy = jest.spyOn(contract, "filterForInvalid").mockImplementation((toFilter) => {
        return toFilter.length === 1 ? Promise.resolve([parseInt(listings[3].chainListingId)]) : Promise.resolve([]);
    });

    const invalid = await listingFilters.filterForInvalidUsingContract(listings);
    expect(invalid.length).toBe(1);
    expect(invalid[0]).toBe(listings[3]);

    expect(blockchainsSpy).toHaveBeenCalledTimes(1);
    expect(contractsSpy).toHaveBeenCalledTimes(1);
    expect(contractsSpy).toHaveBeenCalledWith(EvmContractType.MARKETPLACE);
    expect(contractFactorySpy).toHaveBeenCalledTimes(2);
    expect(contractFactorySpy).toHaveBeenNthCalledWith(
        1,
        new ethers.providers.JsonRpcProvider(chains[0].rpcUrl),
        contracts[0].deploymentAddress
    );
    expect(contractFactorySpy).toHaveBeenNthCalledWith(
        2,
        new ethers.providers.JsonRpcProvider(chains[1].rpcUrl),
        contracts[1].deploymentAddress
    );
    expect(filterInvalidSpy).toHaveBeenCalledTimes(2);
    expect(filterInvalidSpy).toHaveBeenNthCalledWith(
        1,
        [listings[0], listings[1], listings[2]].map((listing) => ({
            seller: listing.sellerAddress,
            price: listing.price,
            listingId: parseInt(listing.chainListingId),
            tokenId: listing.chainTokenId,
            tokenContractAddress: listing.tokenContractAddress
        }))
    );
    expect(filterInvalidSpy).toHaveBeenNthCalledWith(
        2,
        [listings[3]].map((listing) => ({
            seller: listing.sellerAddress,
            price: listing.price,
            listingId: parseInt(listing.chainListingId),
            tokenId: listing.chainTokenId,
            tokenContractAddress: listing.tokenContractAddress
        }))
    );
});
