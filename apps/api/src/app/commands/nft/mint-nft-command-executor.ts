import { NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

import { EntityDto } from "@swan/dto";
import { NftFactory } from "../../domain/nft/nft-factory";
import { EventStore } from "../../infrastructure/event-store";
import { LogAsyncMethod } from "../../infrastructure/logging";
import { NftViewRepository } from "../../views/nft/nft-view-repository";
import { MintNftCommand } from "./mint-nft-command";

@CommandHandler(MintNftCommand)
export class MintNftCommandExecutor implements ICommandHandler<MintNftCommand> {
    constructor(
        private _viewRepository: NftViewRepository,
        private _eventStore: EventStore,
        private _nftFactory: NftFactory
    ) {}

    @LogAsyncMethod
    async execute(command: MintNftCommand): Promise<EntityDto> {
        const foundNft = await this._viewRepository.findByIdAndUserId(command.id, command.userId);

        if (!foundNft) {
            throw new NotFoundException();
        }

        const events = await this._eventStore.findEventByAggregateId(command.id);

        const nft = this._nftFactory.createFromEvents(command.id, events);

        nft.mint(command);
        const savedNft = await nft.commit();

        const entity: EntityDto = {
            id: savedNft.id,
            version: savedNft.version
        };

        return entity;
    }
}
