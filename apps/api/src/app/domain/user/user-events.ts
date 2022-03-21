import { EventPayload, SerializedEvent } from "../../infrastructure/serialized-event";
import { Wallet } from "./wallet";
import { Type } from "class-transformer";

@SerializedEvent("user-created-event")
export class UserCreatedEvent extends EventPayload {
    @Type(() => Wallet)
    wallet: Wallet;

    constructor(wallet: Wallet) {
        super();
        this.wallet = wallet;
    }
}

@SerializedEvent("added-wallet-event")
export class WalletAddedEvent extends EventPayload {
    @Type(() => Wallet)
    wallet: Wallet;

    constructor(wallet: Wallet) {
        super();
        this.wallet = wallet;
    }
}
