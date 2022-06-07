import { EventStore } from "../../infrastructure/event-store";
import { IdGenerator } from "../../infrastructure/id-generator";
import { Injectable } from "@nestjs/common";
import { SourcedEvent } from "../../infrastructure/sourced-event";
import { User } from "./user";
import { UserWallet } from "./user-wallet";

@Injectable()
export class UserFactory {
    constructor(private _store: EventStore, private _idGenerator: IdGenerator) {}

    createFromEvents(id: string, events: Array<SourcedEvent>): User {
        return this._store.connectEntity(User.fromEvents(id, events));
    }

    createNew(firstWallet: UserWallet): User {
        return this._store.connectEntity(User.create(this._idGenerator.generateEntityId(), firstWallet));
    }
}
