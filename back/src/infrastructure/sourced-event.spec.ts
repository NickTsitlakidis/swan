import moment = require('moment');
import { classToPlain } from 'class-transformer';
import { EventBase } from './event-base';
import { SerializedEvent } from './serialized-event';
import { SourcedEvent } from './sourced-event';

@SerializedEvent('test-event')
class TestEvent extends EventBase {
    constructor(id: string) {
        super(moment.utc(), id);
    }
}

test('constructor - skips serializable', () => {
    const expectedDate = new Date();
    moment.now = function () {
        return +expectedDate;
    };

    const event = new SourcedEvent('agr-id');

    expect(event.aggregateId).toBe('agr-id');
    expect(event.id).toBeDefined();
    expect(event.createdAt).toEqual(expectedDate);
});

test('constructor - handles serializable', () => {
    const expectedDate = new Date();
    moment.now = function () {
        return +expectedDate;
    };

    const verifiedEvent = new TestEvent('u-id');
    const event = new SourcedEvent('agr-id', verifiedEvent);

    expect(event.aggregateId).toBe('agr-id');
    expect(event.id).toBeDefined();
    expect(event.createdAt).toEqual(expectedDate);
    expect(event.payload).toEqual(classToPlain(verifiedEvent));
    expect(event.eventName).toBe('test-event');
});

test('payloadTypeIs - returns true for match', () => {
    const event = new SourcedEvent('agr-id', new TestEvent('u-id'));

    expect(event.payloadTypeIs('test-event')).toBe(true);
});

test('payloadTypeIs - returns false for no match', () => {
    const event = new SourcedEvent('agr-id', new TestEvent('u-id'));

    expect(event.payloadTypeIs('other-event')).toBe(false);
});

test('getPayloadAs - returns deserialized object', () => {
    const event = new SourcedEvent('agr-id', new TestEvent('u-id'));

    const deserialized = event.getPayloadAs(TestEvent);
    expect(deserialized).toBeInstanceOf(TestEvent);
    expect(deserialized.aggregateId).toBe('u-id');
});
