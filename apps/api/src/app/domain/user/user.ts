import { EventProcessor, EventSourcedEntity } from "../../infrastructure/event-sourced-entity";
import { SourcedEvent } from "../../infrastructure/sourced-event";
import { getLogger } from "../../infrastructure/logging";
import { isNil } from "lodash";
import { UserCreatedEvent } from "./user-events";

export class User extends EventSourcedEntity {
    private _walletAddress: string;

    constructor(id: string, walletAddress?: string, events?: Array<SourcedEvent>) {
        super(id, events, getLogger(User));

        if (!isNil(walletAddress)) {
            this._walletAddress = walletAddress;
            this.apply(new UserCreatedEvent(this._walletAddress));
        }
    }

    @EventProcessor(UserCreatedEvent)
    private processUserCreatedEvent = (event: UserCreatedEvent) => {
        this._walletAddress = event.walletAddress;
    };
}
