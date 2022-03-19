import { EventProcessor, EventSourcedEntity } from "./event-sourced-entity";
import { getLogger } from "./logging";
import { SourcedEvent } from "./sourced-event";
import { EventPayload, SerializedEvent } from "./serialized-event";

@SerializedEvent("test-event-1")
class TestEvent1 extends EventPayload {}

@SerializedEvent("test-event-2")
class TestEvent2 extends EventPayload {}

class SubEntity extends EventSourcedEntity {
    public published: Array<EventPayload> = [];

    constructor(id: string) {
        super(id, [], getLogger(SubEntity));
    }

    public resolveVersion(events: Array<SourcedEvent>) {
        super.resolveVersion(events);
    }

    public sortEvents(events: Array<SourcedEvent>): Array<SourcedEvent> {
        return super.sortEvents(events);
    }

    publish(events: Array<EventPayload>): Promise<Array<SourcedEvent>> {
        this.published = events;
        return Promise.resolve([]);
    }

    @EventProcessor(TestEvent1)
    processTestEvent1 = () => {};

    @EventProcessor(TestEvent2)
    processTestEvent2 = () => {};
}

class SubEntity2 extends EventSourcedEntity {
    constructor(id: string) {
        super(id, [], getLogger(SubEntity2));
    }
}

test("constructor - initializes values", () => {
    const entity = new SubEntity("ainti");
    expect(entity.appliedEvents).toEqual([]);
    expect(entity.id).toBe("ainti");
    expect(entity.version).toBe(0);
});

test("publish - throws for no override", (endTest) => {
    new SubEntity2("id").publish([]).catch((error) => {
        expect(error).toBe("There is no event publisher assigned");
        endTest();
    });
});

test("buildFromEvents - calls mapped processors after sorting", () => {
    const ev1 = new SourcedEvent("id1", new TestEvent2());
    ev1.aggregateVersion = 10;
    const ev2 = new SourcedEvent("id1", new TestEvent1());
    ev2.aggregateVersion = 2;

    const entity = new SubEntity("id1");

    let last = 0;
    const processor1Spy = jest.spyOn(entity, "processTestEvent2").mockImplementation(() => {
        last = 1;
    });
    const processor2Spy = jest.spyOn(entity, "processTestEvent1").mockImplementation(() => {
        last = 2;
    });

    entity.buildFromEvents([ev1, ev2]);

    expect(processor1Spy).toHaveBeenCalledTimes(1);
    expect(processor1Spy).toHaveBeenCalledWith(ev1.getPayloadAs(TestEvent2));

    expect(processor2Spy).toHaveBeenCalledTimes(1);
    expect(processor2Spy).toHaveBeenCalledWith(ev2.getPayloadAs(TestEvent1));

    expect(last).toBe(1);
});

test("commit - publishes and clear applied events", async () => {
    const entity = new SubEntity("ainti");
    const event1 = new TestEvent2();
    const event2 = new TestEvent2();
    entity.apply(event1);
    entity.apply(event2);

    const result = await entity.commit();
    expect(result.appliedEvents.length).toBe(0);
    expect((result as SubEntity).published).toEqual([event1, event2]);
});

test("commit - returns for no applied events", async () => {
    const entity = new SubEntity("ainti");

    const result = await entity.commit();
    expect(result.appliedEvents.length).toBe(0);
    expect((result as SubEntity).published).toEqual([]);
});

test("apply - adds event to array", () => {
    const entity = new SubEntity("ainti");
    const event = new TestEvent2();
    entity.apply(event);

    expect(entity.appliedEvents.length).toBe(1);
    expect(entity.appliedEvents.indexOf(event)).toBe(0);
});

test("apply - adds multiple events to array", () => {
    const entity = new SubEntity("ainti");
    const event1 = new TestEvent2();
    const event2 = new TestEvent2();
    entity.apply(event1);
    entity.apply(event2);

    expect(entity.appliedEvents.length).toBe(2);
    expect(entity.appliedEvents.indexOf(event1)).toBe(0);
    expect(entity.appliedEvents.indexOf(event2)).toBe(1);
});

test("sortEvents - sorts multiple by version", () => {
    const ev1 = new SourcedEvent("id");
    ev1.aggregateVersion = 5;
    const ev2 = new SourcedEvent("id");
    ev2.aggregateVersion = 1;
    const ev3 = new SourcedEvent("id");
    ev3.aggregateVersion = 41;

    const sorted = new SubEntity("id").sortEvents([ev1, ev2, ev3]);
    expect(sorted).toEqual([ev2, ev1, ev3]);
});

test("resolveVersion - finds greatest version for multiple events", () => {
    const ev1 = new SourcedEvent("id");
    ev1.aggregateVersion = 5;
    const ev2 = new SourcedEvent("id");
    ev2.aggregateVersion = 1;
    const ev3 = new SourcedEvent("id");
    ev3.aggregateVersion = 41;

    const entity = new SubEntity("id");
    entity.resolveVersion([ev1, ev2, ev3]);
    expect(entity.version).toBe(41);
});
