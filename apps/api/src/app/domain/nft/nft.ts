import { EventProcessor, EventSourcedEntity } from "../../infrastructure/event-sourced-entity";
import { NftCreatedEvent, NftMintedEvent, UploadedNftMetadataEvent } from "./nft-events";
import { NftStatus } from "./nft-status";
import { BadRequestException } from "@nestjs/common";
import { getLogger } from "../../infrastructure/logging";
import { SourcedEvent } from "../../infrastructure/sourced-event";
import { NftMetadata } from "./nft-metadata";
import { MintNftCommand } from "../../commands/nft/mint-nft-command";
import { BlockchainActionsRegistryService } from "../../support/blockchains/blockchain-actions-registry-service";

export class Nft extends EventSourcedEntity {
    private _status: NftStatus;
    private _userId: string;
    private _blockchainId: string;
    private _categoryId: string;
    private _metadataUri: string;

    static fromEvents(id: string, events: Array<SourcedEvent>): Nft {
        const nft = new Nft(id);
        nft.processEvents(events);
        return nft;
    }

    static create(id: string, userId: string, blockchainId: string, categoryId: string): Nft {
        const nft = new Nft(id);
        nft._blockchainId = blockchainId;
        nft._categoryId = categoryId;
        nft._userId = userId;
        nft._status = NftStatus.CREATED;
        nft.apply(new NftCreatedEvent(userId, blockchainId, categoryId));
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

    get categoryId(): string {
        return this._categoryId;
    }

    get userId(): string {
        return this._userId;
    }

    async uploadFiles(blockchainActionsService: BlockchainActionsRegistryService, metadata: NftMetadata): Promise<Nft> {
        if (this._status !== NftStatus.CREATED) {
            throw new BadRequestException(`Wrong nft status : ${this._status}`);
        }

        const service = await blockchainActionsService.getService(this._blockchainId);
        const uploadedFiles = await service.uploadMetadata(metadata);

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
        this._categoryId = event.categoryId;
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
