import { Embeddable, Property } from "@mikro-orm/core";

@Embeddable()
export class ChainTransactionView {
    @Property()
    blockNumber?: number;

    @Property()
    transactionHash: string;

    constructor(transactionId: string, blockNumber?: number) {
        this.blockNumber = blockNumber;
        this.transactionHash = transactionId;
    }
}
