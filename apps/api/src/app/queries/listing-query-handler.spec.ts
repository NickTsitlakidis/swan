import { PaginationDto } from "@swan/dto";
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

test("getActiveListings - returns empty array when no active listings are found", async () => {
    const repoSpy = jest.spyOn(repoMock, "findAllActive").mockResolvedValue([[], 0]);

    const dto: PaginationDto = {
        skip: 0,
        limit: 50
    };
    const { items } = await handler.getActiveListings(dto);
    expect(items.length).toBe(0);

    expect(repoSpy).toHaveBeenCalledTimes(1);

    expect(repoSpy).toHaveBeenCalledWith(dto.skip, dto.limit);
});

test("getActiveListings - returns two valid active listings", async () => {
    const listingViews = [new ListingView(), new ListingView()];
    listingViews[0].id = new ObjectID().toHexString();
    listingViews[0].blockchainId = "block1";
    listingViews[0].categoryId = "cat1";
    listingViews[0].chainListingId = "chainListingId";
    listingViews[0].chainTokenId = "1";
    listingViews[0].listingCreatedTransaction = new ChainTransactionView("transactionId", 333);
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
    listingViews[1].chainTokenId = "2";
    listingViews[1].listingCreatedTransaction = new ChainTransactionView("transactionId2", 333);
    listingViews[1].nftAddress = "nftAddress2";
    listingViews[1].nftId = "nftId2";
    listingViews[1].price = 25;
    listingViews[1].sellerAddress = "sellerAddress2";
    listingViews[1].status = ListingStatus.ACTIVE;
    listingViews[1].tokenContractAddress = "tokenContractAddress2";
    listingViews[1].userId = "user1";
    listingViews[1].walletId = "walletId2";

    const countSpy = jest.spyOn(repoMock, "findAllActive").mockResolvedValue([listingViews, 2]);

    const dto: PaginationDto = {
        skip: 0,
        limit: 50
    };
    const { items, count } = await handler.getActiveListings(dto);
    expect(items.length).toBe(2);

    expect(items[0].id).toBe(listingViews[0].id);
    expect(items[0].blockchainId).toBe("block1");
    expect(items[0].categoryId).toBe("cat1");
    expect(items[0].chainTokenId).toBe(1);
    expect(items[0].nftAddress).toBe("nftAddress");
    expect(items[0].price).toBe(22);
    expect(items[0].sellerAddress).toBe("sellerAddress");
    expect(items[0].tokenContractAddress).toBe("tokenContractAddress");

    expect(items[1].id).toBe(listingViews[1].id);
    expect(items[1].blockchainId).toBe("block2");
    expect(items[1].categoryId).toBe("cat2");
    expect(items[1].chainTokenId).toBe(2);
    expect(items[1].nftAddress).toBe("nftAddress2");
    expect(items[1].price).toBe(25);
    expect(items[1].sellerAddress).toBe("sellerAddress2");
    expect(items[1].tokenContractAddress).toBe("tokenContractAddress2");

    expect(count).toBe(2);

    expect(countSpy).toHaveBeenCalledTimes(1);

    expect(countSpy).toHaveBeenCalledWith(dto.skip, dto.limit);
});
