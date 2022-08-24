import { EventPayload, SerializedEvent } from "../../infrastructure/serialized-event";

@SerializedEvent("listing-created-event")
export class ListingCreatedEvent extends EventPayload {
    constructor(
        public price: number,
        public userId: string,
        public categoryId: string,
        public blockchainId: string,
        public tokenContractAddress?: string,
        public chainTokenId?: string,
        public nftId?: string
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
    constructor() {
        super();
    }
}
