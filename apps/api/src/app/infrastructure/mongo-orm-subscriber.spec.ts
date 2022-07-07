import { MongoDocument } from "./mongo-document";
import { Embeddable, Embedded, Entity, Property } from "@mikro-orm/core";
import { cleanUpMongo, getCollection } from "../test-utils/test-modules";
import { Test } from "@nestjs/testing";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { EntityManager } from "@mikro-orm/mongodb";
import { Collection, ObjectId } from "mongodb";
import { keys } from "lodash";
import { MongoOrmSubscriber } from "./mongo-orm-subscriber";

@Embeddable()
class Nested {
    @Property()
    nestedProp: string;
}

@Entity({ collection: "test-entities" })
class TestEntity extends MongoDocument {
    @Property()
    prop1: string;

    @Property()
    prop2: number;

    @Embedded(() => Nested, { object: true, nullable: true })
    prop3: Nested;
}

let testModule;
let entityManager: EntityManager;
let collection: Collection<any>;

beforeEach(async () => {
    testModule = await Test.createTestingModule({
        imports: [
            MikroOrmModule.forRoot({
                type: "mongo",
                validateRequired: false,
                forceUndefined: true,
                autoLoadEntities: true,
                tsNode: true,
                debug: true,
                allowGlobalContext: true,
                clientUrl: process.env.MONGO_URL,
                subscribers: [new MongoOrmSubscriber()]
            }),
            MikroOrmModule.forFeature([TestEntity])
        ]
    }).compile();
    collection = getCollection("test-entities", testModule);
    await collection.deleteMany({});

    entityManager = testModule.get(EntityManager);
});

afterEach(async () => {
    await cleanUpMongo(testModule);
});

test("removeUnsetValues - clears nested null values", async () => {
    const en = new TestEntity();
    en.prop1 = "down";
    en.prop2 = 34;
    en.prop3 = new Nested();
    en.prop3.nestedProp = null;
    en.id = new ObjectId().toHexString();

    await entityManager.fork().persistAndFlush(en);
    const found = await collection.find({ _id: en._id }).toArray();
    expect(found[0].prop3).toBeDefined();
    expect(keys(found[0].prop3).length).toBe(0);
});

test("removeUnsetValues - clears nested undefined values", async () => {
    const en = new TestEntity();
    en.prop1 = "down";
    en.prop2 = 34;
    en.prop3 = new Nested();
    en.prop3.nestedProp = undefined;
    en.id = new ObjectId().toHexString();

    await entityManager.fork().persistAndFlush(en);
    const found = await collection.find({ _id: en._id }).toArray();
    expect(found[0].prop3).toBeDefined();
    expect(keys(found[0].prop3).length).toBe(0);
});

test("removeUnsetValues - clears top level null values", async () => {
    const en = new TestEntity();
    en.prop1 = null;
    en.prop2 = null;
    en.id = new ObjectId().toHexString();

    await entityManager.fork().persistAndFlush(en);
    const found = await collection.find({ _id: en._id }).toArray();
    expect(keys(found[0]).length).toBe(1);
});

test("removeUnsetValues - clears top level undefined values", async () => {
    const en = new TestEntity();
    en.prop1 = undefined;
    en.prop2 = undefined;
    en.id = new ObjectId().toHexString();

    await entityManager.fork().persistAndFlush(en);
    const found = await collection.find({ _id: en._id }).toArray();
    expect(keys(found[0]).length).toBe(1);
});

test("removeUnsetValues - clears both top level and nested values", async () => {
    const en = new TestEntity();
    en.prop1 = null;
    en.prop2 = undefined;
    en.prop3 = new Nested();
    en.prop3.nestedProp = null;
    en.id = new ObjectId().toHexString();

    await entityManager.fork().persistAndFlush(en);
    const found = await collection.find({ _id: en._id }).toArray();
    expect(keys(found[0]).length).toBe(2);
    expect(found[0].prop3).toBeDefined();
    expect(keys(found[0].prop3).length).toBe(0);
});

test("removeUnsetValues - leaves unaffected nested values", async () => {
    const en = new TestEntity();
    en.prop1 = undefined;
    en.prop2 = null;
    en.prop3 = new Nested();
    en.prop3.nestedProp = "other";
    en.id = new ObjectId().toHexString();

    await entityManager.fork().persistAndFlush(en);
    const found = await collection.find({ _id: en._id }).toArray();
    expect(found[0].prop3).toBeDefined();
    expect(found[0].prop3.nestedProp).toBe("other");
});

test("removeUnsetValues - leaves unaffected top level values", async () => {
    const en = new TestEntity();
    en.prop1 = "one";
    en.prop2 = 2;
    en.prop3 = new Nested();
    en.prop3.nestedProp = "other";
    en.id = new ObjectId().toHexString();

    await entityManager.fork().persistAndFlush(en);
    const found = await collection.find({ _id: en._id }).toArray();
    expect(found[0].prop1).toBe("one");
    expect(found[0].prop2).toBe(2);
    expect(found[0].prop3).toBeDefined();
    expect(found[0].prop3.nestedProp).toBe("other");
});
