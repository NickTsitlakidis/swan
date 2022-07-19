import { Logger } from "@nestjs/common";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { NftCreatedEvent, NftMintedEvent, UploadedNftMetadataEvent } from "../../domain/nft/nft-events";
import { getLogger, LogAsyncMethod } from "../../infrastructure/logging";
import { NftView } from "./nft-view";
import { NftViewRepository } from "./nft-view-repository";

@EventsHandler([NftCreatedEvent, NftMintedEvent, UploadedNftMetadataEvent])
export class NftProjector implements IEventHandler<NftCreatedEvent> {
    private _logger: Logger;

    constructor(private readonly _repository: NftViewRepository) {
        this._logger = getLogger(NftProjector);
    }

    @LogAsyncMethod
    async handle(event: NftCreatedEvent | NftMintedEvent | UploadedNftMetadataEvent): Promise<NftView> {
        let view: NftView;

        if (event instanceof NftCreatedEvent) {
            view = new NftView();
            view.id = event.aggregateId;
            view.blockchainId = event.blockchainId;
            view.userId = event.userId;
        } else {
            view = await this._repository.findById(event.aggregateId);
        }

        if (!view) {
            this._logger.error("NftView was not found");
            return;
        }

        if (event instanceof UploadedNftMetadataEvent) {
            view.metadataUri = event.metadataUri;
            view.fileUri = event.imageUri;
        }

        if (event instanceof NftMintedEvent) {
            view.transactionId = event.transactionId;
            view.tokenAddress = event.tokenAddress;
            view.tokenId = event.tokenId;
        }

        return this._repository.save(view);
    }
}
