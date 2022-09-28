import { EventProcessor, EventSourcedEntity } from "../../infrastructure/event-sourced-entity";
import { NftChangeUserEvent, NftCreatedEvent, NftMintedEvent, UploadedNftMetadataEvent } from "./nft-events";
import { NftStatus } from "./nft-status";
import { BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { getLogger } from "../../infrastructure/logging";
import { SourcedEvent } from "../../infrastructure/sourced-event";
import { NftMetadata } from "./nft-metadata";
import { MintNftCommand } from "../../commands/nft/mint-nft-command";
import { BlockchainActionsRegistryService } from "../../support/blockchains/blockchain-actions-registry-service";
import { isNil } from "lodash";

export class Nft extends EventSourcedEntity {
    private _status: NftStatus;
    private _userId: string;
    private _blockchainId: string;
    private _categoryId: string;
    private _metadataUri: string;
    private _userWalletId: string;
    private _tokenId: string;
    private _mintTransactionId: string;
    private _tokenAddress: string;

    static fromEvents(id: string, events: Array<SourcedEvent>): Nft {
        const nft = new Nft(id);
        nft.processEvents(events);
        return nft;
    }

    static create(id: string, userId: string, blockchainId: string, categoryId: string, userWalletId: string): Nft {
        const nft = new Nft(id);
        nft._blockchainId = blockchainId;
        nft._categoryId = categoryId;
        nft._userId = userId;
        nft._status = NftStatus.CREATED;
        nft._userWalletId = userWalletId;
        nft.apply(new NftCreatedEvent(userId, blockchainId, categoryId, userWalletId));
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

    get userWalletId(): string {
        return this._userWalletId;
    }

    async uploadFiles(actionsRegistry: BlockchainActionsRegistryService, metadata: NftMetadata): Promise<Nft> {
        if (this._status !== NftStatus.CREATED) {
            throw new BadRequestException(`Wrong nft status : ${this._status}`);
        }

        const service = await actionsRegistry.getService(this._blockchainId);
        if (isNil(service)) {
            this.logger.error(`No matching blockchain actions for chain id : ${this._blockchainId}`);
            throw new InternalServerErrorException(
                `No matching blockchain actions for chain id : ${this._blockchainId}`
            );
        }
        const uploadedFiles = await service.uploadMetadata(metadata);

        this._metadataUri = uploadedFiles.metadataIPFSUri;
        this._status = NftStatus.UPLOADED_FILES;
        this.apply(new UploadedNftMetadataEvent(this._metadataUri, uploadedFiles.imageIPFSUri));

        return this;
    }

    mint(mintTransaction: MintNftCommand) {
        if (this._status !== NftStatus.UPLOADED_FILES) {
            throw new BadRequestException(`Wrong nft status : ${this._status}`);
        }
        this._status = NftStatus.MINTED;
        this._tokenId = mintTransaction.tokenId;
        this._tokenAddress = mintTransaction.tokenContractAddress;
        this._mintTransactionId = mintTransaction.transactionId;
        this.apply(
            new NftMintedEvent(
                mintTransaction.transactionId,
                mintTransaction.tokenContractAddress,
                mintTransaction.tokenId
            )
        );
    }

    changeUser(userId: string, userWalletId: string) {
        if (this._status !== NftStatus.MINTED) {
            throw new BadRequestException(`Wrong nft status : ${this._status}`);
        }
        this._userId = userId;
        this._userWalletId = userWalletId;
        this.apply(new NftChangeUserEvent(userId, userWalletId));
    }

    @EventProcessor(NftCreatedEvent)
    private processNftCreated = (event: NftCreatedEvent) => {
        this._userId = event.userId;
        this._blockchainId = event.blockchainId;
        this._categoryId = event.categoryId;
        this._userWalletId = event.userWalletId;
        this._status = NftStatus.CREATED;
    };

    @EventProcessor(UploadedNftMetadataEvent)
    private processUploadedNftMetadataEvent = (event: UploadedNftMetadataEvent) => {
        this._status = NftStatus.UPLOADED_FILES;
        this._metadataUri = event.metadataUri;
    };

    @EventProcessor(NftMintedEvent)
    private processNftMintedEvent = (event: NftMintedEvent) => {
        this._status = NftStatus.MINTED;
        this._tokenId = event.tokenId;
        this._tokenAddress = event.tokenAddress;
        this._mintTransactionId = event.transactionId;
    };

    @EventProcessor(NftChangeUserEvent)
    private processNftChangeUserEvent = (event: NftChangeUserEvent) => {
        this._userId = event.userId;
        this._userWalletId = event.userWalletId;
    };
}
