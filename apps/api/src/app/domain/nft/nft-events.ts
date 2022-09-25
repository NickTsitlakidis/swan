import { EventPayload, SerializedEvent } from "../../infrastructure/serialized-event";

@SerializedEvent("nft-minted-event")
export class NftMintedEvent extends EventPayload {
    constructor(public transactionId: string, public tokenAddress: string, public tokenId: string) {
        super();
    }
}

@SerializedEvent("uploaded-nft-metadata-event")
export class UploadedNftMetadataEvent extends EventPayload {
    constructor(public metadataUri: string, public imageUri: string) {
        super();
    }
}

@SerializedEvent("nft-created-event")
export class NftCreatedEvent extends EventPayload {
    constructor(
        public userId: string,
        public blockchainId: string,
        public categoryId: string,
        public userWalletId: string
    ) {
        super();
    }
}

@SerializedEvent("nft-change-user-event")
export class NftChangeUserEvent extends EventPayload {
    constructor(public userId: string, public userWalletId: string) {
        super();
    }
}
