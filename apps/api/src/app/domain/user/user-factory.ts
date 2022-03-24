import { EventStore } from "../../infrastructure/event-store";
import { IdGenerator } from "../../infrastructure/id-generator";
import { Injectable } from "@nestjs/common";
import { SourcedEvent } from "../../infrastructure/sourced-event";
import { Wallet } from "./wallet";
import { User } from "./user";

@Injectable()
export class UserFactory {
    constructor(private _store: EventStore, private _idGenerator: IdGenerator) {}

    createFromEvents(id: string, events: Array<SourcedEvent>): User {
        return this._store.connectEntity(new User(id, undefined, events));
    }

    createNew(firstWallet: Wallet): User {
        return this._store.connectEntity(new User(this._idGenerator.generateEntityId(), firstWallet));
    }
}
