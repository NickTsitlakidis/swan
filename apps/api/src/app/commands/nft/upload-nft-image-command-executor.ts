import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UploadNftImageCommand } from "./upload-nft-image-command";
import { NftViewRepository } from "../../views/nft/nft-view-repository";
import { BadRequestException } from "@nestjs/common";
import { EventStore } from "../../infrastructure/event-store";
import { Nft } from "../../domain/nft/nft";
import { NftFactory } from "../../views/nft/nft-factory";

@CommandHandler(UploadNftImageCommand)
export class UploadNftImageCommandExecutor implements ICommandHandler<UploadNftImageCommand> {

    constructor(private _nftViewRepository: NftViewRepository,
                private _factory: NftFactory,
                private _eventStore: EventStore) {
    }

    async execute(command: UploadNftImageCommand): Promise<any> {
        const nftView = await this._nftViewRepository.findByIdAndUserId(command.nftId, command.userId);

        if(!nftView) {
            throw new BadRequestException("Nft doesn't exist");
        }

        const events = await this._eventStore.findEventByAggregateId(nftView.id);
        const nft = this._factory.createFromEvents(nftView.id, events);

        nft.uploadImage();
    }

}