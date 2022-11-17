import { UserWalletView } from "../user-wallet/user-wallet-view";
import { ObjectId } from "mongodb";
import { getUnitTestingModule } from "../../test-utils/test-modules";
import { ListingViewRepository } from "./listing-view-repository";
import { ListingProjector } from "./listing-projector";
import { ListingView } from "./listing-view";
import { ListingCreatedEvent } from "../../domain/listing/listing-events";
import { ListingStatus } from "../../domain/listing/listing-status";
import { Buyer } from "../../domain/listing/buyer";
import { BuyerView } from "./buyer-view";

let repositoryMock: ListingViewRepository;
let projector: ListingProjector;

beforeEach(async () => {
    const moduleRef = await getUnitTestingModule(ListingProjector);

    projector = moduleRef.get(ListingProjector);
    repositoryMock = moduleRef.get(ListingViewRepository);
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

    const expectedSaved = new ListingView();
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
