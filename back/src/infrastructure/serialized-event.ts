import { find } from "lodash";
import { InternalServerErrorException } from "@nestjs/common";

const REGISTERED_EVENTS: Array<{ eventName: string; eventClass: any }> = [];

/**
 * A decorator which registers an event name and the decorated class as a pair. The name is included in the json object
 * persisted to Mongo. During retrieval of events, the name is matched to the class so that it is properly deserialized.
 * @param eventName The event name to match the class. If the name has been previously added, an exception will be thrown.
 * @constructor
 */
export function SerializedEvent(eventName: string): ClassDecorator {
    return (target) => {
        if (REGISTERED_EVENTS.some((e) => e.eventName === eventName)) {
            throw new InternalServerErrorException(`${eventName} is already registered as stored event`);
        }
        REGISTERED_EVENTS.push({
            eventName: eventName,
            eventClass: target
        });
    };
}

/**
 * Returns the event name that matches the class of the provided object.
 * @param target
 */
export function getEventNameForObject(target: unknown) {
    const found = find(REGISTERED_EVENTS, { eventClass: target.constructor });
    return found.eventName;
}

/**
 * Returns the event name that matches the provided class. Or undefined.
 * @param target The class to be checked.
 */
export function getEventNameForClass(target: unknown) {
    const found = find(REGISTERED_EVENTS, { eventClass: target });
    return found.eventName;
}

/**
 * Returns the class that matches the provided name. Or undefined.
 * @param name The event name to be checked.
 */
export function getEventClassForName(name: string) {
    const found = find(REGISTERED_EVENTS, { eventName: name });
    return found.eventClass;
}

/**
 * Returns if the provided class has a registered event name.
 * @param target The class to be checked.
 */
export function hasEventName(target: unknown) {
    return find(REGISTERED_EVENTS, { eventClass: target.constructor }) !== undefined;
}
