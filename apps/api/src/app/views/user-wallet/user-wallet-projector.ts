import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { WalletAddedEvent, UserCreatedEvent } from "../../domain/user/user-events";
import { LogAsyncMethod } from "../../infrastructure/logging";
import { UserWalletView } from "./user-wallet-view";
import { UserWalletViewRepository } from "./user-wallet-view-repository";

@EventsHandler(UserCreatedEvent, WalletAddedEvent)
export class UserWalletProjector implements IEventHandler<UserCreatedEvent | WalletAddedEvent> {
    constructor(private _repository: UserWalletViewRepository) {}

    @LogAsyncMethod
    handle(event: UserCreatedEvent | WalletAddedEvent): Promise<UserWalletView> {
        const newWallet = new UserWalletView();
        newWallet.id = event.wallet.id;
        newWallet.address = event.wallet.address;
        newWallet.blockchainId = event.wallet.blockchainId;
        newWallet.userId = event.aggregateId;
        newWallet.walletId = event.wallet.walletId;

        return this._repository.save(newWallet);
    }
}
