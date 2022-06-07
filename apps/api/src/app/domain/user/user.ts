import { EventProcessor, EventSourcedEntity } from "../../infrastructure/event-sourced-entity";
import { SourcedEvent } from "../../infrastructure/sourced-event";
import { getLogger } from "../../infrastructure/logging";
import { WalletAddedEvent, UserCreatedEvent } from "./user-events";
import { BadRequestException } from "@nestjs/common";
import { UserWallet } from "./user-wallet";

export class User extends EventSourcedEntity {
    private _wallets: Array<UserWallet>;

    static fromEvents(id: string, events: Array<SourcedEvent>): User {
        const u = new User(id);
        u.processEvents(events);
        return u;
    }

    static create(id: string, wallet: UserWallet): User {
        const u = new User(id);
        u._wallets = [wallet];
        u.apply(new UserCreatedEvent(wallet));
        return u;
    }

    private constructor(id: string) {
        super(id, getLogger(User));
    }

    addWallet(wallet: UserWallet) {
        if (this._wallets.some((w) => w.address === wallet.address && w.blockchainId === wallet.blockchainId)) {
            throw new BadRequestException("Wallet is already added for this user");
        }

        this._wallets.push(wallet);
        this.apply(new WalletAddedEvent(wallet));
    }

    @EventProcessor(UserCreatedEvent)
    private processUserCreatedEvent = (event: UserCreatedEvent) => {
        this._wallets = [event.wallet];
    };

    @EventProcessor(WalletAddedEvent)
    private processWalletAddedEvent = (event: WalletAddedEvent) => {
        this._wallets.push(event.wallet);
    };
}
