import { EventPayload, SerializedEvent } from "../../infrastructure/serialized-event";
import { NftStatus } from "./nft-status";

@SerializedEvent("nft-minted-event")
export class NftMintedEvent extends EventPayload {
    constructor(
        public status: NftStatus,
        public transactionId: string,
        public tokenAddress: string,
        public tokenId: string
    ) {
        super();
    }
}

@SerializedEvent("uploaded-nft-metadata-event")
export class UploadedNftMetadataEvent extends EventPayload {
    constructor(public status: NftStatus, public metadataUri: string, public imageUri: string) {
        super();
    }
}

@SerializedEvent("nft-created-event")
export class NftCreatedEvent extends EventPayload {
    constructor(public userId: string, public blockchainId: string) {
        super();
    }
}
