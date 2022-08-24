import { Embeddable, Property } from "@mikro-orm/core";

@Embeddable()
export class ChainTransactionView {
    @Property()
    blockNumber?: number;

    @Property()
    transactionId: string;

    constructor(blockNumber: number, transactionId: string) {
        this.blockNumber = blockNumber;
        this.transactionId = transactionId;
    }
}
