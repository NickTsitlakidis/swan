import moment = require("moment");
import { EventPayload, SerializedEvent } from "./serialized-event";
import { SourcedEvent } from "./sourced-event";
import { keys } from "lodash";

@SerializedEvent("test-event")
class TestEvent extends EventPayload {
    field1: string;
    field2: string;
}

test("constructor - skips serializable", () => {
    const expectedDate = new Date();
    moment.now = function () {
        return +expectedDate;
    };

    const event = new SourcedEvent("agr-id");

    expect(event.aggregateId).toBe("agr-id");
    expect(event._id).toBeDefined();
    expect(event.createdAt).toEqual(expectedDate);
});

test("constructor - handles serializable", () => {
    const expectedDate = new Date();
    moment.now = function () {
        return +expectedDate;
    };

    const testEvent = new TestEvent();
    testEvent.field1 = "the-field";
    testEvent.field2 = undefined;
    const event = new SourcedEvent("agr-id", testEvent);

    expect(event.aggregateId).toBe("agr-id");
    expect(event._id).toBeDefined();
    expect(event.createdAt).toEqual(expectedDate);
    expect(keys(event.payload).length).toEqual(1);
    expect(event.payload["field1"]).toBe("the-field");
    expect(event.eventName).toBe("test-event");
});

test("payloadTypeIs - returns true for match", () => {
    const event = new SourcedEvent("agr-id", new TestEvent());

    expect(event.payloadTypeIs("test-event")).toBe(true);
});

test("payloadTypeIs - returns false for no match", () => {
    const event = new SourcedEvent("agr-id", new TestEvent());

    expect(event.payloadTypeIs("other-event")).toBe(false);
});

test("getPayloadAs - returns deserialized object", () => {
    const event = new SourcedEvent("agr-id", new TestEvent());

    const deserialized = event.getPayloadAs(TestEvent);
    expect(deserialized).toBeInstanceOf(TestEvent);
});
