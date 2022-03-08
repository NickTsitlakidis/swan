import moment = require("moment");
import { instanceToPlain } from "class-transformer";
import { EventPayload, SerializedEvent } from "./serialized-event";
import { SourcedEvent } from "./sourced-event";

@SerializedEvent("test-event")
class TestEvent extends EventPayload {}

test("constructor - skips serializable", () => {
    const expectedDate = new Date();
    moment.now = function () {
        return +expectedDate;
    };

    const event = new SourcedEvent("agr-id");

    expect(event.aggregateId).toBe("agr-id");
    expect(event.id).toBeDefined();
    expect(event.createdAt).toEqual(expectedDate);
});

test("constructor - handles serializable", () => {
    const expectedDate = new Date();
    moment.now = function () {
        return +expectedDate;
    };

    const verifiedEvent = new TestEvent();
    const event = new SourcedEvent("agr-id", verifiedEvent);

    expect(event.aggregateId).toBe("agr-id");
    expect(event.id).toBeDefined();
    expect(event.createdAt).toEqual(expectedDate);
    expect(event.payload).toEqual(instanceToPlain(verifiedEvent));
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
