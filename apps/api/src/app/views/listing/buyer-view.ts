import { Embeddable, Property } from "@mikro-orm/core";

@Embeddable()
export class BuyerView {
    @Property()
    userId: string;

    @Property()
    userWalletId: string;

    constructor(userWalletId: string, userId: string) {
        this.userId = userId;
        this.userWalletId = userWalletId;
    }
}
