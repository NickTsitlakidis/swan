import { Injectable } from "@nestjs/common";
import { EventStore } from "../../infrastructure/event-store";
import { IdGenerator } from "../../infrastructure/id-generator";
import { SourcedEvent } from "../../infrastructure/sourced-event";
import { Nft } from "./nft";
import { NftCreateExternal } from "./nft-create-external";

@Injectable()
export class NftFactory {
    constructor(private _store: EventStore, private _idGenerator: IdGenerator) {}

    createFromEvents(id: string, events: Array<SourcedEvent>): Nft {
        return this._store.connectEntity(Nft.fromEvents(id, events));
    }

    createNew(userId: string, blockchainId: string, categoryId: string, userWalletId: string): Nft {
        return this._store.connectEntity(
            Nft.create(this._idGenerator.generateEntityId(), userId, blockchainId, categoryId, userWalletId)
        );
    }

    createExternal(userId: string, createExternalNft: NftCreateExternal): Nft {
        return this._store.connectEntity(
            Nft.createExternal(this._idGenerator.generateEntityId(), userId, createExternalNft)
        );
    }
}
