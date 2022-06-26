import { EventPayload, SerializedEvent } from "../../infrastructure/serialized-event";
import { NftStatus } from "./nft-status";

@SerializedEvent("nft-minted")
export class NftMinted extends EventPayload {
    constructor(public status: NftStatus) {
        super();
    }
}

@SerializedEvent("uploaded-nft-metadata-event")
export class UploadedNftMetadataEvent extends EventPayload {
    constructor(public status: NftStatus, public metadataUri: string, public imageUri: string) {
        super();
    }
}

@SerializedEvent("nft-created")
export class NftCreated extends EventPayload {

    constructor(public userId: string, public blockchainId: string) {
        super();
    }
}