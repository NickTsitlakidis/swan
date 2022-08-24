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
    ListingSubmittedEvent,
    ListingUpdatedPriceEvent
} from "../../domain/listing/listing-events";
import { ListingStatus } from "../../domain/listing/listing-status";

let repositoryMock: ListingViewRepository;
let projector: ListingProjector;

beforeEach(async () => {
    const moduleRef = await getUnitTestingModule(ListingProjector);

    projector = moduleRef.get(ListingProjector);
    repositoryMock = moduleRef.get(ListingViewRepository);
});

test("handle ListingCreatedEvent - Saves new ListingView", async () => {
    const saved = new ListingView();
    const saveSpy = jest.spyOn(repositoryMock, "save").mockResolvedValue(saved);

    const id = new ObjectId().toHexString();
    const userId = "user-1";
    const price = 5;
    const categoryId = "category";
    const blockchainId = "blockchain";
    const tokenContractAddress = "addr";
    const chainTokenId = "chainTokenId";
    const nftId = "nftId";
    const event = new ListingCreatedEvent(
        price,
        userId,
        categoryId,
        blockchainId,
        tokenContractAddress,
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
    expectedSaved.tokenContractAddress = "addr";
    expectedSaved.chainTokenId = "chainTokenId";
    expectedSaved.nftId = "nftId";
    expectedSaved.status = ListingStatus.CREATED;
    delete expectedSaved.createdAt;

    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining(expectedSaved));
});
