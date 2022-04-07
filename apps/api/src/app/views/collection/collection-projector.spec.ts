import { Test } from "@nestjs/testing";
import { Blockchains } from "@nft-marketplace/common";
import { ObjectId } from "mongodb";
import { CollectionCreatedEvent } from "../../domain/collection/collection-events";
import { getThrower } from "../../test-utils/mocking";
import { CollectionLinksView } from "./collection-links-view";
import { CollectionProjector } from "./collection-projector";
import { CollectionView } from "./collection-view";
import { CollectionViewRepository } from "./collection-view-repository";

const repositoryMock: Partial<CollectionViewRepository> = {
    save: getThrower()
};

let projector: CollectionProjector;

beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
        providers: [
            CollectionProjector,
            {
                provide: CollectionViewRepository,
                useValue: repositoryMock
            }
        ]
    }).compile();

    projector = moduleRef.get(CollectionProjector);
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
        Blockchains.SOLANA,
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
    expectedSaved.blockchain = event.blockchain;
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

    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).toHaveBeenCalledWith(expectedSaved);
});
