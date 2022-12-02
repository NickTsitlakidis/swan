import { Logger } from "@nestjs/common";
import { isNil } from "lodash";
import {DateTime} from "luxon";

export function LogAsyncMethod(target, propertyKey: string, descriptor: PropertyDescriptor) {
    if (isNil(descriptor)) {
        descriptor = Object.getOwnPropertyDescriptor(target, propertyKey);
    }

    const logger = new Logger(target.constructor.name);
    const methodName = `${target.constructor.name} : ${propertyKey}`;
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args) {
        const startedAt = DateTime.now();
        try {
            const result = await originalMethod.apply(this, args);
            const duration = DateTime.now().diff(startedAt).milliseconds;
            logger.debug(`Method {${methodName}} duration : ${duration} ms`);
            return result;
        } catch (err) {
            logger.error(`Method {${methodName}} / error message : ${err.message} / stack : ${err.stack}`);
            throw err;
        }
    };
    return descriptor;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function getLogger(contextClass: Function): Logger {
    return new Logger(contextClass.name);
}
