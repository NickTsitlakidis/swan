import { Collection, ObjectId } from "mongodb";
import { Connection } from "typeorm";
import { Test } from "@nestjs/testing";
import { EventStore } from "./event-store";
import { Aggregate } from "./aggregate";
import { InternalServerErrorException } from "@nestjs/common";
import { cleanUpMongo, getCollection, MONGO_MODULE } from "../test-utils/mongo";
import { SourcedEvent } from "./sourced-event";
import { EventPayload, SerializedEvent } from "./serialized-event";

let eventStore: EventStore;
let eventsCollection: Collection<any>;
let aggregatesCollection: Collection<any>;
let connection: Connection;

@SerializedEvent("test-event-1")
class TestEvent1 extends EventPayload {}

@SerializedEvent("test-event-2")
class TestEvent2 extends EventPayload {}

beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
        imports: [MONGO_MODULE],
        providers: [EventStore]
    }).compile();

    eventStore = moduleRef.get(EventStore);
    connection = moduleRef.get(Connection);
    eventsCollection = getCollection("events", connection);
    aggregatesCollection = getCollection("aggregates", connection);
    await eventsCollection.deleteMany({});
    await aggregatesCollection.deleteMany({});
});

afterEach(async () => {
    await cleanUpMongo(connection);
});

test("save - throws for concurrency issue", async () => {
    const ag = new Aggregate();
    ag.version = 5;
    ag.id = new ObjectId().toHexString();

    await aggregatesCollection.insertOne({
        _id: ag._id,
        version: 6
    });

    await expect(eventStore.save([new SourcedEvent(ag.id, new TestEvent1())], ag)).rejects.toThrow(
        InternalServerErrorException
    );

    const eventsCount = await eventsCollection.countDocuments();
    expect(eventsCount).toBe(0);

    const storedAggregates = await aggregatesCollection.find({ _id: ag._id }).toArray();
    expect(storedAggregates[0].version).toBe(6);
});

test("save - is no op for no events", async () => {
    const ag = new Aggregate();
    ag.version = 5;
    ag.id = new ObjectId().toHexString();

    await eventStore.save([], ag);

    const eventsCount = await eventsCollection.countDocuments();
    expect(eventsCount).toBe(0);

    const aggregatesCount = await aggregatesCollection.countDocuments();
    expect(aggregatesCount).toBe(0);
});

test("save - increases version and stores events and aggregate", async () => {
    const ag = new Aggregate();
    ag.version = 5;
    ag.id = new ObjectId().toHexString();

    await aggregatesCollection.insertOne({
        _id: ag._id,
        version: 5
    });

    const events = [new SourcedEvent(ag.id, new TestEvent2()), new SourcedEvent(ag.id, new TestEvent1())];

    const saved = await eventStore.save(events, ag);

    const storedAggregates = await aggregatesCollection.find({ _id: ag._id }).toArray();
    expect(storedAggregates[0].version).toBe(7);

    const storedEvents = await eventsCollection.find({}).toArray();
    expect(storedEvents.length).toBe(2);
    expect(storedEvents.every((ev) => ev.aggregateId === ag.id));

    expect(storedEvents[0].eventName).toBe("test-event-2");
    expect(storedEvents[0].aggregateVersion).toBe(6);
    expect(storedEvents[0].payload).toEqual(events[0].payload);
    expect(storedEvents[0].createdAt).toEqual(events[0].createdAt);
    expect(storedEvents[0]._id.toHexString()).toBe(events[0].id);

    expect(storedEvents[1].eventName).toBe("test-event-1");
    expect(storedEvents[1].aggregateVersion).toBe(7);
    expect(storedEvents[1].payload).toEqual(events[1].payload);
    expect(storedEvents[1].createdAt).toEqual(events[1].createdAt);
    expect(storedEvents[1]._id.toHexString()).toBe(events[1].id);

    expect(saved).toEqual(events);
    expect(saved[0].aggregateVersion).toBe(6);
    expect(saved[1].aggregateVersion).toBe(7);
});

test("findEventByAggregateId - returns sorted events", async () => {
    const aggregateId = new ObjectId().toHexString();

    await eventsCollection.insertMany([
        {
            _id: new ObjectId(),
            createdAt: new Date(),
            aggregateId: aggregateId,
            aggregateVersion: 10,
            eventName: "one",
            payload: "payload-1"
        },
        {
            _id: new ObjectId(),
            createdAt: new Date(),
            aggregateId: aggregateId,
            aggregateVersion: 5,
            eventName: "two",
            payload: "payload-2"
        },
        {
            _id: new ObjectId(),
            createdAt: new Date(),
            aggregateId: aggregateId,
            aggregateVersion: 15,
            eventName: "three",
            payload: "payload-3"
        },
        {
            _id: new ObjectId(),
            createdAt: new Date(),
            aggregateId: new ObjectId().toHexString(),
            aggregateVersion: 15,
            eventName: "four",
            payload: "payload-4"
        }
    ]);

    const result = await eventStore.findEventByAggregateId(aggregateId);

    expect(result.length).toBe(3);
    expect(result[0].aggregateVersion).toBe(5);
    expect(result[0].eventName).toBe("two");
    expect(result[1].aggregateVersion).toBe(10);
    expect(result[1].eventName).toBe("one");
    expect(result[2].aggregateVersion).toBe(15);
    expect(result[2].eventName).toBe("three");
});
