import { Injectable } from "@nestjs/common";
import { EventStore } from "../../infrastructure/event-store";
import { IdGenerator } from "../../infrastructure/id-generator";
import { SourcedEvent } from "../../infrastructure/sourced-event";
import { Collection } from "./collection";
import { CreateCollectionCommand } from "../../commands/collection/create-collection-command";

@Injectable()
export class CollectionFactory {
    constructor(private _store: EventStore, private _idGenerator: IdGenerator) {}

    createFromEvents(id: string, events: Array<SourcedEvent>): Collection {
        return this._store.connectEntity(Collection.fromEvents(id, events));
    }

    createNew(collectionInfo: CreateCollectionCommand): Collection {
        return this._store.connectEntity(Collection.create(this._idGenerator.generateEntityId(), collectionInfo));
    }
}
