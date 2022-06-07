import { EventPayload, SerializedEvent } from "../../infrastructure/serialized-event";
import { Type } from "class-transformer";
import { UserWallet } from "./user-wallet";

@SerializedEvent("user-created-event")
export class UserCreatedEvent extends EventPayload {
    @Type(() => UserWallet)
    wallet: UserWallet;

    constructor(wallet: UserWallet) {
        super();
        this.wallet = wallet;
    }
}

@SerializedEvent("added-wallet-event")
export class WalletAddedEvent extends EventPayload {
    @Type(() => UserWallet)
    wallet: UserWallet;

    constructor(wallet: UserWallet) {
        super();
        this.wallet = wallet;
    }
}
