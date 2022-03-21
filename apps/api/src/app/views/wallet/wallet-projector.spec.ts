import { Test } from "@nestjs/testing";
import { ObjectId } from "mongodb";
import { UserCreatedEvent } from "../../domain/user/user-events";
import { Wallet } from "../../domain/user/wallet";
import { Blockchains, SupportedWallets } from "@nft-marketplace/common";
import { getThrowingFunction } from "../../test-utils/mocking";
import { WalletViewRepository } from "./wallet-view-repository";
import { WalletProjector } from "./wallet-projector";
import { WalletView } from "./wallet-view";

const repositoryMock: Partial<WalletViewRepository> = {
    save: getThrowingFunction()
};

let projector: WalletProjector;

beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
        providers: [
            WalletProjector,
            {
                provide: WalletViewRepository,
                useValue: repositoryMock
            }
        ]
    }).compile();

    projector = moduleRef.get(WalletProjector);
});

test("handle UserCreatedEvent - saves new wallet view", async () => {
    const saved = new WalletView();
    const saveSpy = jest.spyOn(repositoryMock, "save").mockResolvedValue(saved);

    const id = new ObjectId().toHexString();
    const event = new UserCreatedEvent(
        new Wallet(new ObjectId().toHexString(), "123", Blockchains.ETHEREUM, SupportedWallets.METAMASK)
    );
    event.aggregateId = id;
    const handled = await projector.handle(event);

    expect(handled).toBe(saved);

    const expectedSaved = new WalletView();
    expectedSaved.id = event.wallet.id;
    expectedSaved.address = "123";
    expectedSaved.userId = id;
    expectedSaved.name = SupportedWallets.METAMASK;
    expectedSaved.blockchain = Blockchains.ETHEREUM;

    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).toHaveBeenCalledWith(expectedSaved);
});
