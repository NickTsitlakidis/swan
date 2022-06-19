import { ObjectId } from "mongodb";
import { UserCreatedEvent } from "../../domain/user/user-events";
import { UserWalletViewRepository } from "./user-wallet-view-repository";
import { UserWalletProjector } from "./user-wallet-projector";
import { UserWalletView } from "./user-wallet-view";
import { UserWallet } from "../../domain/user/user-wallet";
import { getUnitTestingModule } from "../../test-utils/test-modules";

let repositoryMock: UserWalletViewRepository;
let projector: UserWalletProjector;

beforeEach(async () => {
    const moduleRef = await getUnitTestingModule(UserWalletProjector);

    projector = moduleRef.get(UserWalletProjector);
    repositoryMock = moduleRef.get(UserWalletViewRepository);
});

test("handle UserCreatedEvent - saves new wallet view", async () => {
    const saved = new UserWalletView();
    const saveSpy = jest.spyOn(repositoryMock, "save").mockResolvedValue(saved);

    const id = new ObjectId().toHexString();
    const event = new UserCreatedEvent(new UserWallet(new ObjectId().toHexString(), "123", "chain", "wallet"));
    event.aggregateId = id;
    const handled = await projector.handle(event);

    expect(handled).toBe(saved);

    const expectedSaved = new UserWalletView();
    expectedSaved.id = event.wallet.id;
    expectedSaved.address = "123";
    expectedSaved.userId = id;
    expectedSaved.walletId = "wallet";
    expectedSaved.blockchainId = "chain";
    delete expectedSaved.createdAt;

    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining(expectedSaved));
});
