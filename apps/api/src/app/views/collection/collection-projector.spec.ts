import { ObjectId } from "mongodb";
import { CollectionCreatedEvent } from "../../domain/collection/collection-events";
import { CollectionLinksView } from "./collection-links-view";
import { CollectionProjector } from "./collection-projector";
import { CollectionView } from "./collection-view";
import { CollectionViewRepository } from "./collection-view-repository";
import { getUnitTestingModule } from "../../test-utils/test-modules";

let repositoryMock: CollectionViewRepository;
let projector: CollectionProjector;

beforeEach(async () => {
    const moduleRef = await getUnitTestingModule(CollectionProjector);

    projector = moduleRef.get(CollectionProjector);
    repositoryMock = moduleRef.get(CollectionViewRepository);
});

test("handle CollectionCreatedEvent - saves new collection view", async () => {
    const saved = new CollectionView();
    const saveSpy = jest.spyOn(repositoryMock, "save").mockResolvedValue(saved);

    const id = new ObjectId().toHexString();
    const event = new CollectionCreatedEvent(
        "user",
        "name",
        "cat",
        "customUrl",
        "desc",
        false,
        "img",
        1,
        "block",
        "token",
        "instaLink",
        "medLink",
        "telLing",
        "webLink",
        "discLing"
    );
    event.aggregateId = id;

    const handled = await projector.handle(event);

    expect(handled).toBe(saved);

    const expectedSaved = new CollectionView();
    expectedSaved.id = id;
    expectedSaved.userId = "user";
    expectedSaved.blockchainId = event.blockchainId;
    expectedSaved.categoryId = event.categoryId;
    expectedSaved.customUrl = event.customUrl;
    expectedSaved.description = event.description;
    expectedSaved.imageUrl = event.imageUrl;
    expectedSaved.isExplicit = event.isExplicit;
    expectedSaved.links = new CollectionLinksView(
        event.instagramLink,
        event.discordLink,
        event.telegramLink,
        event.websiteLink,
        event.mediumLink
    );
    expectedSaved.name = event.name;
    expectedSaved.paymentToken = event.paymentToken;
    expectedSaved.salePercentage = event.salePercentage;
    delete expectedSaved.createdAt;

    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining(expectedSaved));
});
