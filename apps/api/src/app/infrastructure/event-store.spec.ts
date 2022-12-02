import { Collection, ObjectId } from "mongodb";
import { Test, TestingModule } from "@nestjs/testing";
import { EventStore } from "./event-store";
import { Aggregate } from "./aggregate";
import { cleanUpMongo, getCollection } from "../test-utils/test-modules";
import { SourcedEvent } from "./sourced-event";
import { EventPayload, SerializedEvent } from "./serialized-event";
import { EventSourcedEntity } from "./event-sourced-entity";
import { getLogger } from "./logging";
import { QueueEventBus } from "./queue-event-bus";
import { instanceToPlain } from "class-transformer";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { ConfigModule } from "@nestjs/config";
import { AggregateConcurrencyException } from "./aggregate-concurrency-exception";

let eventStore: EventStore;
let eventsCollection: Collection<any>;
let aggregatesCollection: Collection<any>;
let testingModule: TestingModule;

@SerializedEvent("test-event-1")
class TestEvent1 extends EventPayload {}

@SerializedEvent("test-event-2")
class TestEvent2 extends EventPayload {}

class TestEntity extends EventSourcedEntity {
    constructor(id: string) {
        super(id, getLogger(TestEntity));
    }
}

const eventBusMock: Partial<QueueEventBus> = {
    publishAll: () => undefined
};

beforeEach(async () => {
    process.env.MONGO_URI = process.env.MONGO_URL;
    testingModule = await Test.createTestingModule({
        imports: [
            MikroOrmModule.forRoot({
                type: "mongo",
                validateRequired: false,
                forceUndefined: true,
                autoLoadEntities: true,
                tsNode: true,
                allowGlobalContext: true,
                clientUrl: process.env.MONGO_URL
            }),
            MikroOrmModule.forFeature([Aggregate, SourcedEvent]),
            ConfigModule
        ],
        providers: [
            EventStore,
            {
                provide: QueueEventBus,
                useValue: eventBusMock
            }
        ]
    }).compile();

    eventStore = testingModule.get(EventStore);
    eventsCollection = getCollection("events", testingModule);
    aggregatesCollection = getCollection("aggregates", testingModule);
    await eventsCollection.deleteMany({});
    await aggregatesCollection.deleteMany({});
});

afterEach(async () => {
    await cleanUpMongo(testingModule);
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
        AggregateConcurrencyException
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
    expect(storedEvents[0]._id.toHexString()).toBe(events[0]._id.toHexString());

    expect(storedEvents[1].eventName).toBe("test-event-1");
    expect(storedEvents[1].aggregateVersion).toBe(7);
    expect(storedEvents[1].payload).toEqual(events[1].payload);
    expect(storedEvents[1].createdAt).toEqual(events[1].createdAt);
    expect(storedEvents[1]._id.toHexString()).toBe(events[1]._id.toHexString());

    expect(saved).toEqual(events);
    expect(saved[0].aggregateVersion).toBe(6);
    expect(saved[1].aggregateVersion).toBe(7);
});

test("findEventsByAggregateId - returns sorted events", async () => {
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

    const result = await eventStore.findEventsByAggregateId(aggregateId);

    expect(result.length).toBe(3);
    expect(result[0].aggregateVersion).toBe(5);
    expect(result[0].eventName).toBe("two");
    expect(result[1].aggregateVersion).toBe(10);
    expect(result[1].eventName).toBe("one");
    expect(result[2].aggregateVersion).toBe(15);
    expect(result[2].eventName).toBe("three");
});

test("findEventsByAggregateIds - returns matching entity events", async () => {
    const aggregateId1 = new ObjectId().toHexString();
    const aggregateId2 = new ObjectId().toHexString();
    const aggregateId3 = new ObjectId().toHexString();

    await eventsCollection.insertMany([
        {
            _id: new ObjectId(),
            createdAt: new Date(),
            aggregateId: aggregateId1,
            aggregateVersion: 10,
            eventName: "one",
            payload: "payload-1"
        },
        {
            _id: new ObjectId(),
            createdAt: new Date(),
            aggregateId: aggregateId2,
            aggregateVersion: 5,
            eventName: "two",
            payload: "payload-2"
        },
        {
            _id: new ObjectId(),
            createdAt: new Date(),
            aggregateId: aggregateId3,
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

    const result = await eventStore.findEventsByAggregateIds([aggregateId1, aggregateId2]);

    expect(result.length).toBe(2);
    expect(result[0].eventName).toBe("one");
    expect(result[1].eventName).toBe("two");
});

test("connectEntity - sets a publish that returns for empty events", async () => {
    const id = new ObjectId().toHexString();
    const beforeConnect = new TestEntity(id);
    const e = eventStore.connectEntity(beforeConnect);

    const result = await e.publish([]);
    expect(result).toEqual([]);

    const storedAggregates = await aggregatesCollection.find({}).toArray();
    expect(storedAggregates.length).toBe(0);

    const storedEvents = await eventsCollection.find({}).toArray();
    expect(storedEvents.length).toBe(0);

    expect(beforeConnect).toBe(e);
});

test("connectEntity - sets a publish that stops when save throws", (endTest) => {
    const publishAllSpy = jest.spyOn(eventBusMock, "publishAll").mockResolvedValue([]);
    const u = eventStore.connectEntity(new TestEntity(new ObjectId().toHexString()));

    const event = new TestEvent1();

    cleanUpMongo(testingModule).then(() => {
        u.publish([event]).catch(() => {
            expect(publishAllSpy).toHaveBeenCalledTimes(0);
            endTest();
        });
    });
});

test("connectEntity - sets a publish that saves and publishes events", async () => {
    const publishAllSpy = jest.spyOn(eventBusMock, "publishAll").mockResolvedValue([]);

    const u = eventStore.connectEntity(new TestEntity(new ObjectId().toHexString()));
    const event = new TestEvent1();
    const publishedEvents = await u.publish([event]);

    expect(publishedEvents.length).toBe(1);
    expect(publishedEvents[0].eventName).toBe("test-event-1");
    expect(publishedEvents[0].payload).toEqual(instanceToPlain(event));
    expect(publishedEvents[0].aggregateId).toBe(u.id);

    const storedAggregates = await aggregatesCollection.find({}).toArray();
    expect(storedAggregates.length).toBe(1);

    const storedEvents = await eventsCollection.find({}).toArray();
    expect(storedEvents.length).toBe(1);

    expect(storedAggregates[0]._id.toHexString()).toBe(u.id);
    expect(storedAggregates[0].version).toBe(u.version + 1);

    expect(storedEvents[0].aggregateId).toBe(u.id);
    expect(storedEvents[0].eventName).toBe("test-event-1");
    expect(storedEvents[0].payload).toEqual(instanceToPlain(event));
    expect(storedEvents[0]._id).toBeDefined();

    expect(publishAllSpy).toHaveBeenCalledTimes(1);
    expect(publishAllSpy).toHaveBeenCalledWith([event]);
});
