import { EventProcessor, EventSourcedEntity } from "../../infrastructure/event-sourced-entity";
import { NftCreated, NftMinted, NftUploadedImage, NftUploadedMetadata } from "./nft-events";
import { NftStatus } from "./nft-status";
import { BadRequestException } from "@nestjs/common";
import { getLogger } from "../../infrastructure/logging";
import { SourcedEvent } from "../../infrastructure/sourced-event";

export class Nft extends EventSourcedEntity {

    private _status: NftStatus;
    private _userId: string;
    private _blockchainId: string;
    private _metadata: any;

    static fromEvents(id: string, events: Array<SourcedEvent>): Nft {
        const nft = new Nft(id);
        nft.processEvents(events);
        return nft;
    }

    static create(id: string, userId: string, blockchainId: string ): Nft {
        const nft = new Nft(id);
        nft._blockchainId = blockchainId;
        nft._userId = userId;
        this.apply(new NftCreated(userId, blockchainId));
        return nft;
    }

    constructor(id: string) {
        super(id, getLogger(Nft));
    }

    uploadImage() {
        if(this._status !== NftStatus.UPLOADED_METADATA) {
            throw new BadRequestException(`Wrong nft status : ${this._status}`)
        }

        this._status = NftStatus.UPLOADED_IMAGE;
        this.apply(new NftUploadedImage(this._status));
    }

    uploadMetadata() {
        if(this._status) {
            throw new BadRequestException(`Wrong nft status : ${this._status}`)
        }
        this._status = NftStatus.UPLOADED_METADATA;
        this.apply(new NftUploadedMetadata(this._status))
    }

    mint() {
        if(this._status !== NftStatus.UPLOADED_IMAGE) {
            throw new BadRequestException(`Wrong nft status : ${this._status}`)
        }
        this._status = NftStatus.MINTED;
        this.apply(new NftMinted(this._status));
    }

    @EventProcessor(NftCreated)
    private processNftCreated = (event: NftCreated) => {
        this._userId = event.userId;
        this._blockchainId = event.blockchainId;
        delete this._status;
    }

    @EventProcessor(NftMinted)
    private processNftMinted = (event: NftMinted) => {
        this._status = event.status;
    }

    @EventProcessor(NftUploadedImage)
    private processNftUploadedImage = (event: NftUploadedImage) => {
        this._status = event.status;
    }

    @EventProcessor(NftUploadedMetadata)
    private processNftUploadedMetadata = (event: NftUploadedMetadata) => {
        this._status = event.status;
    }
}