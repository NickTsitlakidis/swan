import { UserViewRepository } from "./user-view-repository";
import { UserProjector } from "./user-projector";
import { Test } from "@nestjs/testing";
import { UserView } from "./user-view";
import { UserCreatedEvent } from "../../domain/user/user-created-event";
import { ObjectId } from "mongodb";

const repositoryMock: Partial<UserViewRepository> = {
    save: () => Promise.reject("should never be called")
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

test("handle UserCreatedEvent - saves new view with wallet", async () => {
    const saved = new UserView();
    const saveSpy = jest.spyOn(repositoryMock, "save").mockResolvedValue(saved);

    const id = new ObjectId().toHexString();
    const event = new UserCreatedEvent("the-wallet");
    event.aggregateId = id;
    const handled = await projector.handle(event);

    expect(handled).toBe(saved);

    const expectedSaved = new UserView();
    expectedSaved.id = id;
    expectedSaved.walletAddress = "the-wallet";

    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).toHaveBeenCalledWith(expectedSaved);
});
