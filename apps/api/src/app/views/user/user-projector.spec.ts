import { UserViewRepository } from "./user-view-repository";
import { UserProjector } from "./user-projector";
import { Test } from "@nestjs/testing";
import { UserView } from "./user-view";
import { ObjectId } from "mongodb";
import { UserCreatedEvent } from "../../domain/user/user-events";
import { Wallet } from "../../domain/user/wallet";
import { Blockchains, SupportedWallets } from "@nft-marketplace/common";
import { getThrower } from "../../test-utils/mocking";

const repositoryMock: Partial<UserViewRepository> = {
    save: getThrower()
};

let projector: UserProjector;

beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
        providers: [
            UserProjector,
            {
                provide: UserViewRepository,
                useValue: repositoryMock
            }
        ]
    }).compile();

    projector = moduleRef.get(UserProjector);
});

test("handle UserCreatedEvent - saves new user view", async () => {
    const saved = new UserView();
    const saveSpy = jest.spyOn(repositoryMock, "save").mockResolvedValue(saved);

    const id = new ObjectId().toHexString();
    const event = new UserCreatedEvent(
        new Wallet(new ObjectId().toHexString(), "123", Blockchains.ETHEREUM, SupportedWallets.METAMASK)
    );
    event.aggregateId = id;
    const handled = await projector.handle(event);

    expect(handled).toBe(saved);

    const expectedSaved = new UserView();
    expectedSaved.id = id;

    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).toHaveBeenCalledWith(expectedSaved);
});
