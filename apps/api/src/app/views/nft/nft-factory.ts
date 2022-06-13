import { Injectable } from "@nestjs/common";
import { EventStore } from "../../infrastructure/event-store";
import { IdGenerator } from "../../infrastructure/id-generator";
import { SourcedEvent } from "../../infrastructure/sourced-event";
import { Nft } from "../../domain/nft/nft";

@Injectable()
export class NftFactory {
    constructor(private _store: EventStore, private _idGenerator: IdGenerator) {}

    createFromEvents(id: string, events: Array<SourcedEvent>): Nft {
        return this._store.connectEntity(Nft.fromEvents(id, events));
    }

    // createNew(firstWallet: UserWallet): User {
    //     return this._store.connectEntity(User.create(this._idGenerator.generateEntityId(), firstWallet));
    // }
}