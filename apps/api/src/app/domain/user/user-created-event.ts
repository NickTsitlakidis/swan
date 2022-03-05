import { EventPayload, SerializedEvent } from "../../infrastructure/serialized-event";

@SerializedEvent("user-created-event")
export class UserCreatedEvent extends EventPayload {
    constructor(public walletAddress: string) {
        super();
    }
}
