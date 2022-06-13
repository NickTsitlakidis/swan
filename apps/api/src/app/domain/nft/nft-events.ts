import { EventPayload, SerializedEvent } from "../../infrastructure/serialized-event";
import { NftStatus } from "./nft-status";

@SerializedEvent("nft-minted")
export class NftMinted extends EventPayload {
    constructor(public status: NftStatus) {
        super();
    }
}

@SerializedEvent("nft-uploaded-image")
export class NftUploadedImage extends EventPayload {
    constructor(public status: NftStatus) {
        super();
    }
}

@SerializedEvent("nft-uploaded-metadata")
export class NftUploadedMetadata extends EventPayload {
    constructor(public status: NftStatus) {
        super();
    }
}

@SerializedEvent("nft-created")
export class NftCreated extends EventPayload {

    constructor(public userId: string, public blockchainId: string) {
        super();
    }
}