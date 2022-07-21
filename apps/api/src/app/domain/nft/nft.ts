import { EventProcessor, EventSourcedEntity } from "../../infrastructure/event-sourced-entity";
import { NftCreatedEvent, NftMintedEvent, UploadedNftMetadataEvent } from "./nft-events";
import { NftStatus } from "./nft-status";
import { BadRequestException } from "@nestjs/common";
import { getLogger } from "../../infrastructure/logging";
import { SourcedEvent } from "../../infrastructure/sourced-event";
import { UploaderService } from "../../support/uploader/uploader-service";
import { NftMetadata } from "./nft-metadata";
import { UploadedFiles } from "../../support/uploader/uploaded-files";
import { MintNftCommand } from "../../commands/nft/mint-nft-command";

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
        nft.apply(new NftCreatedEvent(userId, blockchainId));
        return nft;
    }

    private constructor(id: string) {
        super(id, getLogger(Nft));
    }

    get metadataUri(): string {
        return this._metadataUri;
    }

    get status(): NftStatus {
        return this._status;
    }

    get blockchainId(): string {
        return this._blockchainId;
    }

    get userId(): string {
        return this._userId;
    }

    async uploadFiles(metadata: NftMetadata, uploader: UploaderService): Promise<Nft> {
        if (this._status !== NftStatus.CREATED) {
            throw new BadRequestException(`Wrong nft status : ${this._status}`);
        }

        let uploadedFiles: UploadedFiles;
        if (this._blockchainId === "628e9d126b8991c676c19a47") {
            uploadedFiles = await uploader.uploadSolanaMetadata(metadata);
        } else {
            uploadedFiles = await uploader.uploadEvmMetadata(metadata);
        }

        this._metadataUri = uploadedFiles.metadataIPFSUri;
        this._status = NftStatus.UPLOADED_FILES;
        this.apply(new UploadedNftMetadataEvent(this._status, this._metadataUri, uploadedFiles.imageIPFSUri));

        return this;
    }

    mint(mintTransaction: MintNftCommand) {
        if (this._status !== NftStatus.UPLOADED_FILES) {
            throw new BadRequestException(`Wrong nft status : ${this._status}`);
        }
        this._status = NftStatus.MINTED;
        this.apply(
            new NftMintedEvent(
                this._status,
                mintTransaction.transactionId,
                mintTransaction.tokenAddress,
                mintTransaction.tokenId
            )
        );
    }

    @EventProcessor(NftCreatedEvent)
    private processNftCreated = (event: NftCreatedEvent) => {
        this._userId = event.userId;
        this._blockchainId = event.blockchainId;
        this._status = NftStatus.CREATED;
    };

    @EventProcessor(UploadedNftMetadataEvent)
    private processUploadedNftMetadataEvent = (event: UploadedNftMetadataEvent) => {
        this._status = event.status;
        this._metadataUri = event.metadataUri;
    };

    @EventProcessor(NftMintedEvent)
    private processNftMintedEvent = (event: NftMintedEvent) => {
        this._status = event.status;
    };
}
