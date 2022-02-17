import { Injectable } from "@nestjs/common";
import { User } from "./user";
import { EventStoreConnector } from "../../infrastructure/event-store-connector";
import { IdGenerator } from "../../infrastructure/id-generator";

@Injectable()
export class UserFactory {
    constructor(private readonly _idGenerator: IdGenerator, private readonly _connector: EventStoreConnector) {}

    createNew(walletAddress: string): User {
        return this._connector.connect(new User(this._idGenerator.generateEntityId(), walletAddress));
    }
}
