import { EventProcessor, EventSourcedEntity } from "../../infrastructure/event-sourced-entity";
import { NftCreated, NftMinted, UploadedNftMetadataEvent } from "./nft-events";
import { NftStatus } from "./nft-status";
import { BadRequestException } from "@nestjs/common";
import { getLogger } from "../../infrastructure/logging";
import { SourcedEvent } from "../../infrastructure/sourced-event";
import { UploaderService } from "../../support/uploader/uploader-service";
import { NftMetadata } from "./nft-metadata";
import { UploadedFiles } from "../../support/uploader/uploaded-files";

export class Nft extends EventSourcedEntity {

    private _status: NftStatus;
    private _userId: string;
    private _blockchainId: string;
    private _metadataUri: string;

    static fromEvents(id: string, events: Array<SourcedEvent>): Nft {
        const nft = new Nft(id);
        nft.processEvents(events);
        return nft;
    }

    static create(id: string, userId: string, blockchainId: string): Nft {
        const nft = new Nft(id);
        nft._blockchainId = blockchainId;
        nft._userId = userId;
        nft._status = NftStatus.CREATED;
        nft.apply(new NftCreated(userId, blockchainId));
        return nft;
    }

    constructor(id: string) {
        super(id, getLogger(Nft));
    }

    get metadataUri(): string {
        return this._metadataUri;
    }

    async uploadFiles(metadata: NftMetadata, uploader: UploaderService): Promise<Nft> {
        if(this._status !== NftStatus.CREATED) {
            throw new BadRequestException(`Wrong nft status : ${this._status}`);
        }

        let uploadedFiles: UploadedFiles;
        if(this._blockchainId === "628e9d126b8991c676c19a47") {
            uploadedFiles = await uploader.uploadSolanaMetadata(metadata);
        } else {
            //this._metadataUri = await uploader.uploadSolanaMetadata(metadata);
        }

        this._metadataUri = uploadedFiles.metadataIPFSUri;
        this._status = NftStatus.UPLOADED_FILES;
        this.apply(new UploadedNftMetadataEvent(this._status, this._metadataUri, uploadedFiles.imageIPFSUri));

        return this;
    }


    mint() {
        if(this._status !== NftStatus.UPLOADED_FILES) {
            throw new BadRequestException(`Wrong nft status : ${this._status}`)
        }
        this._status = NftStatus.MINTED;
        this.apply(new NftMinted(this._status));
    }

    @EventProcessor(NftCreated)
    private processNftCreated = (event: NftCreated) => {
        this._userId = event.userId;
        this._blockchainId = event.blockchainId;
        this._status = NftStatus.CREATED;
    }

    @EventProcessor(UploadedNftMetadataEvent)
    private processUploadedNftMetadataEvent = (event: UploadedNftMetadataEvent) => {
        this._status = event.status;
        this._metadataUri = event.metadataUri;
    }

}