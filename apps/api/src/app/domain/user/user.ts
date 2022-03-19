import { EventProcessor, EventSourcedEntity } from "../../infrastructure/event-sourced-entity";
import { SourcedEvent } from "../../infrastructure/sourced-event";
import { getLogger } from "../../infrastructure/logging";
import { isNil } from "lodash";
import { UserEvents } from "./user-created-event";

export class User extends EventSourcedEntity {
    private _walletAddress: string;

    constructor(id: string, walletAddress?: string, events?: Array<SourcedEvent>) {
        super(id, events, getLogger(User));

        if (!isNil(walletAddress)) {
            this._walletAddress = walletAddress;
            this.apply(new UserEvents(this._walletAddress));
        }
    }

    @EventProcessor(UserEvents)
    private processUserCreatedEvent = (event: UserEvents) => {
        this._walletAddress = event.walletAddress;
    };
}
