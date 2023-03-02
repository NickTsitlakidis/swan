import { UserWalletView } from "../user-wallet/user-wallet-view";
import { ObjectId } from "mongodb";
import { getUnitTestingModule } from "../../test-utils/test-modules";
import { ListingViewRepository } from "./listing-view-repository";
import { ListingProjector } from "./listing-projector";
import { ListingView } from "./listing-view";
import {
    ListingActivatedEvent,
    ListingCanceledEvent,
    ListingCreatedEvent,
    ListingSoldEvent,
    ListingSubmittedEvent
} from "../../domain/listing/listing-events";
import { ListingStatus } from "../../domain/listing/listing-status";
import { Buyer } from "../../domain/listing/buyer";
import { BuyerView } from "./buyer-view";
import { buildListingView } from "../../test-utils/test-builders";
import { CurrencyList } from "@swan/dto";
import { clone } from "radash";

let repositoryMock: ListingViewRepository;
let projector: ListingProjector;

beforeEach(async () => {
    const moduleRef = await getUnitTestingModule(ListingProjector);

    projector = moduleRef.get(ListingProjector);
    repositoryMock = moduleRef.get(ListingViewRepository);
});

test("handle ListingSoldEvent - updates view", async () => {
    const existingView = buildListingView();

    const saved = new ListingView();
    const saveSpy = jest.spyOn(repositoryMock, "save").mockResolvedValue(saved);
    const findSpy = jest.spyOn(repositoryMock, "findById").mockResolvedValue(existingView);

    const event = new ListingSoldEvent(
        "the-hash",
        new Buyer("u", "w", "a"),
        {
            amount: 33,
            currency: CurrencyList.Ethereum
        },
        99
    );
    event.aggregateId = existingView.id;

    const result = await projector.handle(event);

    expect(result).toBe(saved);

    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(findSpy).toHaveBeenCalledWith(event.aggregateId);

    const cloned = clone(existingView);
    cloned.status = ListingStatus.SOLD;
    cloned.listingSoldTransaction.blockNumber = 99;
    cloned.listingSoldTransaction.transactionHash = "the-hash";
    cloned.buyer = new BuyerView(event.buyer.walletId, event.buyer.userId, event.buyer.address);
    cloned.transactionFee.amount = 33;
    cloned.transactionFee.currency = CurrencyList.Ethereum;

    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).toHaveBeenCalledWith(cloned);
});

test("handle ListingActivatedEvent - updates status, block number and listing id", async () => {
    const existingView = buildListingView();

    const saved = new ListingView();
    const saveSpy = jest.spyOn(repositoryMock, "save").mockResolvedValue(saved);
    const findSpy = jest.spyOn(repositoryMock, "findById").mockResolvedValue(existingView);

    const event = new ListingActivatedEvent(44, 55);
    event.aggregateId = existingView.id;

    const result = await projector.handle(event);

    expect(result).toBe(saved);

    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(findSpy).toHaveBeenCalledWith(event.aggregateId);
    const cloned = clone(existingView);
    cloned.status = ListingStatus.ACTIVE;
    cloned.chainListingId = 55;
    cloned.listingCreatedTransaction.blockNumber = 44;

    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).toHaveBeenCalledWith(cloned);
});

test("handle ListingCanceledEvent - updates status", async () => {
    const existingView = buildListingView();

    const saved = new ListingView();
    const saveSpy = jest.spyOn(repositoryMock, "save").mockResolvedValue(saved);
    const findSpy = jest.spyOn(repositoryMock, "findById").mockResolvedValue(existingView);

    const event = new ListingCanceledEvent(true);
    event.aggregateId = existingView.id;

    const result = await projector.handle(event);

    expect(result).toBe(saved);

    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(findSpy).toHaveBeenCalledWith(event.aggregateId);
    const cloned = clone(existingView);
    cloned.status = ListingStatus.CANCELED;

    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).toHaveBeenCalledWith(cloned);
});

test("handle ListingSubmittedEvent - updates view with transaction and status", async () => {
    const existingView = buildListingView();

    const saved = new ListingView();
    const saveSpy = jest.spyOn(repositoryMock, "save").mockResolvedValue(saved);
    const findSpy = jest.spyOn(repositoryMock, "findById").mockResolvedValue(existingView);

    const event = new ListingSubmittedEvent("the-hash");
    event.aggregateId = existingView.id;

    const result = await projector.handle(event);

    expect(result).toBe(saved);

    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(findSpy).toHaveBeenCalledWith(event.aggregateId);
    const cloned = clone(existingView);
    cloned.status = ListingStatus.SUBMITTED;
    cloned.listingCreatedTransaction.transactionHash = "the-hash";

    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).toHaveBeenCalledWith(cloned);
});

test("handle ListingCreatedEvent - Saves new ListingView", async () => {
    const saved = new ListingView();
    const userWalletView = new UserWalletView();
    userWalletView.address = "userAddress";
    const saveSpy = jest.spyOn(repositoryMock, "save").mockResolvedValue(saved);

    const id = new ObjectId().toHexString();
    const userId = "user-1";
    const sellerAddress = "s-address";
    const price = 5;
    const categoryId = "category";
    const blockchainId = "blockchain";
    const walletId = "walletId";
    const tokenContractAddress = "addr";
    const nftAddress = "nftAddress";
    const chainTokenId = "chainTokenId";
    const animationUrl = "animationUrl";
    const imageUrl = "imageUrl";
    const nftId = "nftId";
    const event = new ListingCreatedEvent(
        new Buyer(userId, walletId, sellerAddress),
        price,
        categoryId,
        blockchainId,
        imageUrl,
        animationUrl,
        tokenContractAddress,
        nftAddress,
        chainTokenId,
        nftId
    );
    event.aggregateId = id;
    const handled = await projector.handle(event);

    expect(handled).toBe(saved);

    const expectedSaved: Partial<ListingView> = new ListingView();
    expectedSaved.id = id;
    expectedSaved.price = 5;
    expectedSaved.categoryId = "category";
    expectedSaved.blockchainId = "blockchain";
    expectedSaved.tokenContractAddress = "addr";
    expectedSaved.nftAddress = "nftAddress";
    expectedSaved.chainTokenId = "chainTokenId";
    expectedSaved.nftId = "nftId";
    expectedSaved.status = ListingStatus.CREATED;
    expectedSaved.imageUrl = "imageUrl";
    expectedSaved.animationUrl = "animationUrl";
    expectedSaved.seller = new BuyerView(walletId, userId, sellerAddress);
    delete expectedSaved.createdAt;

    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining(expectedSaved));
});
