import { EventProcessor, EventSourcedEntity } from "../../infrastructure/event-sourced-entity";
import { SourcedEvent } from "../../infrastructure/sourced-event";
import { getLogger } from "../../infrastructure/logging";
import { isNil } from "lodash";
import { Wallet } from "./wallet";
import { WalletAddedEvent, UserCreatedEvent } from "./user-events";
import { BadRequestException } from "@nestjs/common";

export class User extends EventSourcedEntity {
    private _wallets: Array<Wallet>;

    constructor(id: string, wallet?: Wallet, events?: Array<SourcedEvent>) {
        super(id, events, getLogger(User));

        if (!isNil(wallet)) {
            this._wallets = [wallet];
            this.apply(new UserCreatedEvent(wallet));
        }
    }

    addWallet(wallet: Wallet) {
        if (this._wallets.some((w) => w.address === wallet.address && w.blockchain === wallet.blockchain)) {
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
