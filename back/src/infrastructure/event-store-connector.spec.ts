import { Test } from "@nestjs/testing";
import { QueueEventBus } from "./queue-event-bus";
import { EventStore } from "./event-store";
import { EventStoreConnector } from "./event-store-connector";
import { ObjectId } from "mongodb";
import { InternalServerErrorException } from "@nestjs/common";
import { Aggregate } from "./aggregate";
import { instanceToPlain } from "class-transformer";
import { EventSourcedEntity } from "./event-sourced-entity";
import { EventPayload, SerializedEvent } from "./serialized-event";
import { getLogger } from "./logging";
import { getMockCalledParameters } from "../test-utils/mocking";
import { SourcedEvent } from "./sourced-event";

@SerializedEvent("test-event")
class TestEvent extends EventPayload {}

class TestEntity extends EventSourcedEntity {
    constructor(id: string) {
        super(id, getLogger(TestEntity));
    }
}

const eventBusMock: Partial<QueueEventBus> = {
    publishAll: () => undefined
};

const eventStoreMock: Partial<EventStore> = {
    save: () => undefined
};

let connector: EventStoreConnector;

beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
        imports: [],
        providers: [
            EventStoreConnector,
            {
                provide: EventStore,
                useValue: eventStoreMock
            },
            {
                provide: QueueEventBus,
                useValue: eventBusMock
            }
        ]
    }).compile();

    connector = moduleRef.get(EventStoreConnector);
});

test("connect - sets a publish that returns for empty events", async () => {
    const saveSpy = jest.spyOn(eventStoreMock, "save").mockResolvedValue([]);
    const publishAllSpy = jest.spyOn(eventBusMock, "publishAll").mockResolvedValue({});
    const u = connector.connect(new TestEntity(new ObjectId().toHexString()));

    const result = await u.publish([]);
    expect(result).toEqual([]);

    expect(saveSpy).toHaveBeenCalledTimes(0);
    expect(publishAllSpy).toHaveBeenCalledTimes(0);
});

test("connect - sets a publish that stops when save throws", (endTest) => {
    const saveSpy = jest.spyOn(eventStoreMock, "save").mockRejectedValue(new InternalServerErrorException());
    const publishAllSpy = jest.spyOn(eventBusMock, "publishAll").mockResolvedValue({});
    const u = connector.connect(new TestEntity(new ObjectId().toHexString()));

    const event = new TestEvent();
    u.publish([event]).catch(() => {
        expect(saveSpy).toHaveBeenCalledTimes(1);
        const [events, aggregate] = getMockCalledParameters(saveSpy, 2);

        expect((aggregate as Aggregate).id).toBe(u.id);
        expect((aggregate as Aggregate).version).toBe(u.version);

        expect(events.length).toBe(1);
        expect((events[0] as SourcedEvent).aggregateId).toBe(u.id);
        expect((events[0] as SourcedEvent).eventName).toBe("test-event");
        expect((events[0] as SourcedEvent).payload).toEqual(instanceToPlain(event));
        expect((events[0] as SourcedEvent).id).toBeDefined();

        expect(publishAllSpy).toHaveBeenCalledTimes(0);
        endTest();
    });
});

test("connect - sets a publish that saves and publishes events", (endTest) => {
    const saved = [new SourcedEvent("agr-id")];

    const saveSpy = jest.spyOn(eventStoreMock, "save").mockResolvedValue(saved);
    const publishAllSpy = jest.spyOn(eventBusMock, "publishAll").mockResolvedValue({});

    const u = connector.connect(new TestEntity(new ObjectId().toHexString()));

    const event = new TestEvent();

    u.publish([event]).then((publishedEvents) => {
        expect(publishedEvents).toEqual(saved);

        expect(saveSpy).toHaveBeenCalledTimes(1);
        const [events, aggregate] = getMockCalledParameters(saveSpy, 2);

        expect((aggregate as Aggregate).id).toBe(u.id);
        expect((aggregate as Aggregate).version).toBe(u.version);

        expect(events.length).toBe(1);
        expect((events[0] as SourcedEvent).aggregateId).toBe(u.id);
        expect((events[0] as SourcedEvent).eventName).toBe("test-event");
        expect((events[0] as SourcedEvent).payload).toEqual(instanceToPlain(event));
        expect((events[0] as SourcedEvent).id).toBeDefined();

        expect(publishAllSpy).toHaveBeenCalledTimes(1);
        expect(publishAllSpy).toHaveBeenCalledWith([event]);
        endTest();
    });
});
