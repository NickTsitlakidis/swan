import { EventProcessor, EventSourcedEntity } from "../../infrastructure/event-sourced-entity";
import { SourcedEvent } from "../../infrastructure/sourced-event";
import { getLogger } from "../../infrastructure/logging";
import { isNil } from "lodash";
import { Wallet } from "./wallet";
import { UserCreatedEvent } from "./user-events";

export class User extends EventSourcedEntity {
    private _wallets: Array<Wallet>;

    constructor(id: string, wallet: Wallet, events?: Array<SourcedEvent>) {
        super(id, events, getLogger(User));

        if (!isNil(wallet)) {
            this._wallets = [wallet];
            this.apply(new UserCreatedEvent(wallet));
        }
    }

    @EventProcessor(UserCreatedEvent)
    private processUserCreatedEvent = (event: UserCreatedEvent) => {
        this._wallets = [event.wallet];
    };
}
