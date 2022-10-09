import { Embeddable, Property } from "@mikro-orm/core";
import { CurrencyList } from "@swan/dto";

@Embeddable()
export class TransactionFeeView {
    @Property()
    amount: number;

    @Property()
    currency: CurrencyList;

    constructor(currency: CurrencyList, amount: number) {
        this.amount = amount;
        this.currency = currency;
    }
}
