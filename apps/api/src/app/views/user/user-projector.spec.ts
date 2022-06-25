import { UserViewRepository } from "./user-view-repository";
import { UserProjector } from "./user-projector";
import { UserView } from "./user-view";
import { ObjectId } from "mongodb";
import { UserCreatedEvent } from "../../domain/user/user-events";
import { UserWallet } from "../../domain/user/user-wallet";
import { getUnitTestingModule } from "../../test-utils/test-modules";

let repositoryMock: UserViewRepository;
let projector: UserProjector;

beforeEach(async () => {
    const moduleRef = await getUnitTestingModule(UserProjector);

    projector = moduleRef.get(UserProjector);
    repositoryMock = moduleRef.get(UserViewRepository);
});

test("handle UserCreatedEvent - saves new user view", async () => {
    const saved = new UserView();
    const saveSpy = jest.spyOn(repositoryMock, "save").mockResolvedValue(saved);

    const id = new ObjectId().toHexString();
    const event = new UserCreatedEvent(new UserWallet(new ObjectId().toHexString(), "123", "b-id", "w-id"));
    event.aggregateId = id;
    const handled = await projector.handle(event);

    expect(handled).toBe(saved);

    const expectedSaved = new UserView();
    expectedSaved.id = id;
    delete expectedSaved.memberSince;

    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining(expectedSaved));
});
