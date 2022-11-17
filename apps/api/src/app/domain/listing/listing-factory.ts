import { Injectable } from "@nestjs/common";
import { EventStore } from "../../infrastructure/event-store";
import { IdGenerator } from "../../infrastructure/id-generator";
import { SourcedEvent } from "../../infrastructure/sourced-event";
import { Listing } from "./listing";
import { CreateListingCommand } from "../../commands/listing/create-listing-command";

@Injectable()
export class ListingFactory {
    constructor(private _store: EventStore, private _idGenerator: IdGenerator) {}

    createFromEvents(id: string, events: Array<SourcedEvent>): Listing {
        return this._store.connectEntity(Listing.fromEvents(id, events));
    }

    createNew(command: CreateListingCommand, sellerAddress: string): Listing {
        return this._store.connectEntity(Listing.create(this._idGenerator.generateEntityId(), command, sellerAddress));
    }
}
