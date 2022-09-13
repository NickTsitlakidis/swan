import { getUnitTestingModule } from "../test-utils/test-modules";
import { ObjectID } from "mongodb";
import { ListingView } from "../views/listing/listing-view";
import { ListingViewRepository } from "../views/listing/listing-view-repository";
import { ListingQueryHandler } from "./listing-query-handler";
import { ChainTransactionView } from "../views/listing/chain-transaction-view";
import { ListingStatus } from "../domain/listing/listing-status";

let repoMock: ListingViewRepository;
let handler: ListingQueryHandler;

beforeEach(async () => {
    const testModule = await getUnitTestingModule(ListingQueryHandler);

    handler = testModule.get(ListingQueryHandler);
    repoMock = testModule.get(ListingViewRepository);
});

test("getActiveListings - returns empty array when no collections are found", async () => {
    const repoSpy = jest.spyOn(repoMock, "findAllActive").mockResolvedValue([[], 0]);

    const { listingDtos } = await handler.getActiveListings(0, 50);
    expect(listingDtos.length).toBe(0);

    expect(repoSpy).toHaveBeenCalledTimes(1);

    expect(repoSpy).toHaveBeenCalledWith(0, 50);
});

test("getActiveListings - returns false when collections is not found", async () => {
    const listingViews = [new ListingView(), new ListingView()];
    listingViews[0].id = new ObjectID().toHexString();
    listingViews[0].blockchainId = "block1";
    listingViews[0].categoryId = "cat1";
    listingViews[0].chainListingId = "chainListingId";
    listingViews[0].chainTokenId = "chainTokenId";
    listingViews[0].chainTransaction = new ChainTransactionView("transactionId", 333);
    listingViews[0].nftAddress = "nftAddress";
    listingViews[0].nftId = "nftId";
    listingViews[0].price = 22;
    listingViews[0].sellerAddress = "sellerAddress";
    listingViews[0].status = ListingStatus.ACTIVE;
    listingViews[0].tokenContractAddress = "tokenContractAddress";
    listingViews[0].userId = "user1";
    listingViews[0].walletId = "walletId";
    listingViews[1].id = new ObjectID().toHexString();
    listingViews[1].blockchainId = "block2";
    listingViews[1].categoryId = "cat2";
    listingViews[1].chainListingId = "chainListingId2";
    listingViews[1].chainTokenId = "chainTokenId2";
    listingViews[1].chainTransaction = new ChainTransactionView("transactionId2", 333);
    listingViews[1].nftAddress = "nftAddress2";
    listingViews[1].nftId = "nftId2";
    listingViews[1].price = 25;
    listingViews[1].sellerAddress = "sellerAddress2";
    listingViews[1].status = ListingStatus.ACTIVE;
    listingViews[1].tokenContractAddress = "tokenContractAddress2";
    listingViews[1].userId = "user1";
    listingViews[1].walletId = "walletId2";

    const countSpy = jest.spyOn(repoMock, "findAllActive").mockResolvedValue([listingViews, 2]);

    const { listingDtos, listingsCount } = await handler.getActiveListings(0, 50);
    expect(listingDtos.length).toBe(2);

    expect(listingDtos[0].id).toBe(listingViews[0].id);
    expect(listingDtos[0].blockchainId).toBe("block1");
    expect(listingDtos[0].categoryId).toBe("cat1");
    expect(listingDtos[0].chainTokenId).toBe("chainTokenId");
    expect(listingDtos[0].nftAddress).toBe("nftAddress");
    expect(listingDtos[0].price).toBe(22);
    expect(listingDtos[0].sellerAddress).toBe("sellerAddress");
    expect(listingDtos[0].tokenContractAddress).toBe("tokenContractAddress");

    expect(listingDtos[1].id).toBe(listingViews[1].id);
    expect(listingDtos[1].blockchainId).toBe("block2");
    expect(listingDtos[1].categoryId).toBe("cat2");
    expect(listingDtos[1].chainTokenId).toBe("chainTokenId2");
    expect(listingDtos[1].nftAddress).toBe("nftAddress2");
    expect(listingDtos[1].price).toBe(25);
    expect(listingDtos[1].sellerAddress).toBe("sellerAddress2");
    expect(listingDtos[1].tokenContractAddress).toBe("tokenContractAddress2");

    expect(listingsCount).toBe(2);

    expect(countSpy).toHaveBeenCalledTimes(1);

    expect(countSpy).toHaveBeenCalledWith(0, 50);
});
