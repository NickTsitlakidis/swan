import { UserWalletView } from "./../user-wallet/user-wallet-view";
import { ObjectId } from "mongodb";
import { getUnitTestingModule } from "../../test-utils/test-modules";
import { ListingViewRepository } from "./listing-view-repository";
import { ListingProjector } from "./listing-projector";
import { ListingView } from "./listing-view";
import { ListingCreatedEvent } from "../../domain/listing/listing-events";
import { ListingStatus } from "../../domain/listing/listing-status";
import { UserWalletViewRepository } from "../user-wallet/user-wallet-view-repository";

let repositoryMock: ListingViewRepository;
let projector: ListingProjector;
let userWalletRepo: UserWalletViewRepository;

beforeEach(async () => {
    const moduleRef = await getUnitTestingModule(ListingProjector);

    projector = moduleRef.get(ListingProjector);
    repositoryMock = moduleRef.get(ListingViewRepository);
    userWalletRepo = moduleRef.get(UserWalletViewRepository);
});

test("handle ListingCreatedEvent - Saves new ListingView", async () => {
    const saved = new ListingView();
    const userWalletView = new UserWalletView();
    userWalletView.address = "userAddress";
    const saveSpy = jest.spyOn(repositoryMock, "save").mockResolvedValue(saved);
    const userWalletSpy = jest
        .spyOn(userWalletRepo, "findByUserIdAndWalletIdAndChainId")
        .mockResolvedValue(userWalletView);

    const id = new ObjectId().toHexString();
    const userId = "user-1";
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
        price,
        userId,
        categoryId,
        blockchainId,
        walletId,
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
    expectedSaved.userId = userId;
    expectedSaved.price = 5;
    expectedSaved.categoryId = "category";
    expectedSaved.blockchainId = "blockchain";
    expectedSaved.walletId = "walletId";
    expectedSaved.tokenContractAddress = "addr";
    expectedSaved.sellerAddress = "userAddress";
    expectedSaved.nftAddress = "nftAddress";
    expectedSaved.chainTokenId = "chainTokenId";
    expectedSaved.nftId = "nftId";
    expectedSaved.status = ListingStatus.CREATED;
    expectedSaved.imageUrl = "imageUrl";
    expectedSaved.animationUrl = "animationUrl";
    delete expectedSaved.createdAt;

    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(userWalletSpy).toHaveBeenCalledTimes(1);
    console.log(expectedSaved.createdAt);
    expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining(expectedSaved));
});
