import { ListingFactory } from "../../domain/listing/listing-factory";
import { getUnitTestingModule } from "../../test-utils/test-modules";
import { SubmitListingCommandExecutor } from "./submit-listing-command-executor";
import { EventStore } from "../../infrastructure/event-store";
import { SubmitListingCommand } from "./submit-listing-command";
import { BadRequestException } from "@nestjs/common";
import { ListingCreatedEvent } from "../../domain/listing/listing-events";
import { SourcedEvent } from "../../infrastructure/sourced-event";
import { Listing } from "../../domain/listing/listing";

let factory: ListingFactory;
let executor: SubmitListingCommandExecutor;
let eventStore: EventStore;

beforeEach(async () => {
    const testModule = await getUnitTestingModule(SubmitListingCommandExecutor);
    executor = testModule.get(SubmitListingCommandExecutor);
    factory = testModule.get(ListingFactory);
    eventStore = testModule.get(EventStore);
});

test("execute - throws if listing is missing", async () => {
    const command = new SubmitListingCommand("chained", "listed");

    const eventsSpy = jest.spyOn(eventStore, "findEventByAggregateId").mockResolvedValue([]);

    await expect(executor.execute(command)).rejects.toThrow(BadRequestException);

    expect(eventsSpy).toHaveBeenCalledTimes(1);
    expect(eventsSpy).toHaveBeenCalledWith("listed");
});

test("execute - submits and commits", async () => {
    const command = new SubmitListingCommand("chained", "listed");

    const events = [new SourcedEvent("id", new ListingCreatedEvent(34, "u", "c", "b", "t"))];
    events[0].aggregateVersion = 1;
    const eventsSpy = jest.spyOn(eventStore, "findEventByAggregateId").mockResolvedValue(events);

    const model = Listing.fromEvents("id", events);

    const factorySpy = jest.spyOn(factory, "createFromEvents").mockReturnValue(model);
    const commitSpy = jest.spyOn(model, "commit").mockResolvedValue(model);
    const submitSpy = jest.spyOn(model, "submitToChain").mockImplementation(() => {});

    const result = await executor.execute(command);

    expect(result.id).toBe(model.id);
    expect(result.version).toBe(model.version);

    expect(eventsSpy).toHaveBeenCalledTimes(1);
    expect(eventsSpy).toHaveBeenCalledWith("listed");

    expect(factorySpy).toHaveBeenCalledTimes(1);
    expect(factorySpy).toHaveBeenCalledWith("listed", events);

    expect(commitSpy).toHaveBeenCalledTimes(1);
    expect(submitSpy).toHaveBeenCalledTimes(1);
    expect(submitSpy).toHaveBeenCalledWith("chained");
});
