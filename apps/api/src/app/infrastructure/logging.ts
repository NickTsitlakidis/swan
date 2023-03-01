import { Logger } from "@nestjs/common";
import { isNil } from "@nft-marketplace/utils";
import { DateTime } from "luxon";

export function LogAsyncMethod(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const ownPropertyDescriptor = Object.getOwnPropertyDescriptor(target, propertyKey);
    if (isNil(descriptor) && !isNil(ownPropertyDescriptor)) {
        descriptor = ownPropertyDescriptor;
    }

    const logger = new Logger(target.constructor.name);
    const methodName = `${target.constructor.name} : ${propertyKey}`;
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: Array<unknown>) {
        const startedAt = DateTime.now();
        try {
            const result = await originalMethod.apply(this, args);
            const duration = DateTime.now().diff(startedAt).milliseconds;
            logger.debug(`Method {${methodName}} duration : ${duration} ms`);
            return result;
        } catch (err) {
            const asError = err as Error;
            logger.error(`Method {${methodName}} / error message : ${asError.message} / stack : ${asError.stack}`);
            throw err;
        }
    };
    return descriptor;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function getLogger(contextClass: Function): Logger {
    return new Logger(contextClass.name);
}
