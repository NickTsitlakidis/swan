import { Injectable } from "@nestjs/common";
import { EventStore } from "../../infrastructure/event-store";
import { IdGenerator } from "../../infrastructure/id-generator";
import { SourcedEvent } from "../../infrastructure/sourced-event";
import { BlockchainActionsRegistryService } from "../../support/blockchains/blockchain-actions-registry-service";
import { Nft } from "./nft";

@Injectable()
export class NftFactory {
    constructor(
        private _store: EventStore,
        private _blockchainActionsService: BlockchainActionsRegistryService,
        private _idGenerator: IdGenerator
    ) {}

    createFromEvents(id: string, events: Array<SourcedEvent>): Nft {
        return this._store.connectEntity(Nft.fromEvents(id, events));
    }

    createNew(userId: string, blockchainId: string): Nft {
        return this._store.connectEntity(Nft.create(this._idGenerator.generateEntityId(), userId, blockchainId));
    }
}
