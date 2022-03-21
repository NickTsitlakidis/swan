import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { UserCreatedEvent } from "../../domain/user/user-events";
import { LogAsyncMethod } from "../../infrastructure/logging";
import { WalletView } from "./wallet-view";
import { WalletViewRepository } from "./wallet-view-repository";

@EventsHandler(UserCreatedEvent)
export class WalletProjector implements IEventHandler<UserCreatedEvent> {
    constructor(private _repository: WalletViewRepository) {}

    @LogAsyncMethod
    handle(event: UserCreatedEvent): Promise<WalletView> {
        const newWallet = new WalletView();
        newWallet.id = event.wallet.id;
        newWallet.address = event.wallet.address;
        newWallet.blockchain = event.wallet.blockchain;
        newWallet.userId = event.aggregateId;
        newWallet.name = event.wallet.name;

        return this._repository.save(newWallet);
    }
}
