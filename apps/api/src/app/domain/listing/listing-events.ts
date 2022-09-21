import { EventPayload, SerializedEvent } from "../../infrastructure/serialized-event";
import { Buyer } from "./buyer";
import { TransactionFee } from "./transaction";

@SerializedEvent("listing-created-event")
export class ListingCreatedEvent extends EventPayload {
    constructor(
        public price: number,
        public userId: string,
        public categoryId: string,
        public blockchainId: string,
        public walletId: string,
        public imageUrl: string,
        public animationUrl?: string,
        public tokenContractAddress?: string,
        public nftAddress?: string,
        public chainTokenId?: string,
        public nftId?: string,
        public marketPlaceContractAddress?: string
    ) {
        super();
    }
}

@SerializedEvent("listing-submitted-event")
export class ListingSubmittedEvent extends EventPayload {
    constructor(public chainTransactionId: string) {
        super();
    }
}

@SerializedEvent("listing-activated-event")
export class ListingActivatedEvent extends EventPayload {
    constructor(public blockNumber: number, public chainListingId: number) {
        super();
    }
}

@SerializedEvent("listing-canceled-event")
export class ListingCanceledEvent extends EventPayload {
    constructor() {
        super();
    }
}

@SerializedEvent("listing-updated-price-event")
export class ListingUpdatedPriceEvent extends EventPayload {
    constructor() {
        super();
    }
}

@SerializedEvent("listing-sold-event")
export class ListingSoldEvent extends EventPayload {
    public transactionHash: string;
    public buyer: Buyer;
    public transactionFee: TransactionFee;
    public blockNumber: number;

    constructor(transactionHash: string, buyer: Buyer, transactionFee: TransactionFee, blockNumber?: number) {
        super();
        this.transactionHash = transactionHash;
        this.buyer = buyer;
        this.transactionFee = transactionFee;
        this.blockNumber = blockNumber;
    }
}
