import { ListingFactory } from "../../domain/listing/listing-factory";
import { getUnitTestingModule } from "../../test-utils/test-modules";
import { EventStore } from "../../infrastructure/event-store";
import { BadRequestException } from "@nestjs/common";
import { ListingCreatedEvent } from "../../domain/listing/listing-events";
import { SourcedEvent } from "../../infrastructure/sourced-event";
import { Listing } from "../../domain/listing/listing";
import { ActivateListingCommandExecutor } from "./activate-listing-command-executor";
import { ActivateListingCommand } from "./activate-listing-command";

let factory: ListingFactory;
let executor: ActivateListingCommandExecutor;
let eventStore: EventStore;

beforeEach(async () => {
    const testModule = await getUnitTestingModule(ActivateListingCommandExecutor);
    executor = testModule.get(ActivateListingCommandExecutor);
    factory = testModule.get(ListingFactory);
    eventStore = testModule.get(EventStore);
});

test("execute - throws bad request if listing is missing", async () => {
    const command = new ActivateListingCommand(34, "listed", 65);

    const eventsSpy = jest.spyOn(eventStore, "findEventByAggregateId").mockResolvedValue([]);

    await expect(executor.execute(command)).rejects.toThrow(BadRequestException);

    expect(eventsSpy).toHaveBeenCalledTimes(1);
    expect(eventsSpy).toHaveBeenCalledWith("listed");
});

test("execute - activates and commits", async () => {
    const command = new ActivateListingCommand(34, "listed", 65);

    const events = [new SourcedEvent("id", new ListingCreatedEvent(34, "u", "c", "b", "t", "a"))];
    events[0].aggregateVersion = 1;
    const eventsSpy = jest.spyOn(eventStore, "findEventByAggregateId").mockResolvedValue(events);

    const model = Listing.fromEvents("id", events);

    const factorySpy = jest.spyOn(factory, "createFromEvents").mockReturnValue(model);
    const commitSpy = jest.spyOn(model, "commit").mockResolvedValue(model);
    const activateSpy = jest.spyOn(model, "activate").mockImplementation(() => {});

    const result = await executor.execute(command);

    expect(result.id).toBe(model.id);
    expect(result.version).toBe(model.version);

    expect(eventsSpy).toHaveBeenCalledTimes(1);
    expect(eventsSpy).toHaveBeenCalledWith("listed");

    expect(factorySpy).toHaveBeenCalledTimes(1);
    expect(factorySpy).toHaveBeenCalledWith("listed", events);

    expect(commitSpy).toHaveBeenCalledTimes(1);
    expect(activateSpy).toHaveBeenCalledTimes(1);
    expect(activateSpy).toHaveBeenCalledWith(34, 65);
});
