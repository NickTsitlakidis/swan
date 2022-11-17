import { Embeddable, Property } from "@mikro-orm/core";

@Embeddable()
export class BuyerView {
    @Property()
    userId: string;

    @Property()
    walletId: string;

    @Property()
    address: string;

    constructor(walletId: string, userId: string, address: string) {
        this.userId = userId;
        this.walletId = walletId;
        this.address = address;
    }
}
