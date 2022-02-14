import { EventBase } from "../../infrastructure/event-base";
import { SerializedEvent } from "../../infrastructure/serialized-event";
import * as moment from "moment";

@SerializedEvent("user-created-event")
export class UserCreatedEvent extends EventBase {
    constructor(public walletAddress: string, userId: string) {
        super(moment.utc(), userId);
    }
}
