import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { EntityDto } from "@swan/dto";
import { ListingFactory } from "../../domain/listing/listing-factory";
import { EventStore } from "../../infrastructure/event-store";
import { BadRequestException } from "@nestjs/common";
import { ActivateListingCommand } from "./activate-listing-command";

@CommandHandler(ActivateListingCommand)
export class ActivateListingCommandExecutor implements ICommandHandler<ActivateListingCommand> {
    constructor(private _factory: ListingFactory, private _eventStore: EventStore) {}

    async execute(command: ActivateListingCommand): Promise<EntityDto> {
        const events = await this._eventStore.findEventByAggregateId(command.listingId);

        if (events.length == 0) {
            throw new BadRequestException(`No listing with id ${command.listingId}`);
        }

        const listing = this._factory.createFromEvents(command.listingId, events);
        listing.activate(command.blockNumber, command.chainListingId);
        await listing.commit();
        return new EntityDto(listing.id, listing.version);
    }
}
