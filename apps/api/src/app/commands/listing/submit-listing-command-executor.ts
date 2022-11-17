import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { EntityDto } from "@swan/dto";
import { ListingFactory } from "../../domain/listing/listing-factory";
import { SubmitListingCommand } from "./submit-listing-command";
import { EventStore } from "../../infrastructure/event-store";
import { BadRequestException } from "@nestjs/common";

@CommandHandler(SubmitListingCommand)
export class SubmitListingCommandExecutor implements ICommandHandler<SubmitListingCommand> {
    constructor(private _factory: ListingFactory, private _eventStore: EventStore) {}

    async execute(command: SubmitListingCommand): Promise<EntityDto> {
        const events = await this._eventStore.findEventsByAggregateId(command.listingId);

        if (events.length == 0) {
            throw new BadRequestException(`No listing with id ${command.listingId}`);
        }

        const listing = this._factory.createFromEvents(command.listingId, events);
        listing.submitToChain(command.transactionHash);
        await listing.commit();
        return new EntityDto(listing.id, listing.version);
    }
}
