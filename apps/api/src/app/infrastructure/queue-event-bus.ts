import { EventBus, IEventHandler } from "@nestjs/cqrs";
import { IEvent } from "@nestjs/cqrs/dist/interfaces";
import { isNil } from "@nft-marketplace/utils";
import { getLogger, LogAsyncMethod } from "./logging";

/**
 * A nestjs event bus that publishes all events sequentially.
 * Cases where the processing of an event depends on a previous, require sequential publishing.
 */
export class QueueEventBus extends EventBus {
    private _handlerPairs: Array<{ eventId: string; handler: IEventHandler<IEvent> }>;

    publish<T extends IEvent>(event: T) {
        const found = this._handlerPairs.find((pair) => pair.eventId === this.getEventId(event));
        if (isNil(found)) {
            return Promise.resolve();
        }

        return found.handler.handle(event);
    }

    @LogAsyncMethod
    publishAll<T extends IEvent>(events: T[]) {
        const withHandlers = events.filter((event) => {
            const found = this._handlerPairs.find((pair) => pair.eventId === this.getEventId(event));
            return !isNil(found);
        });

        const promises = [];
        for (let i = 0; i < withHandlers.length; i++) {
            const event = withHandlers[i];
            const handlerMatches = this._handlerPairs.filter((pair) => pair.eventId === this.getEventId(event));
            for (let j = 0; j < handlerMatches.length; j++) {
                const eventPromise = async () =>
                    new Promise((resolve, reject) => {
                        handlerMatches[j].handler
                            .handle(event)
                            .then((handlerResult: unknown) => resolve(handlerResult))
                            .catch((error: unknown) => {
                                reject(error);
                            });
                    });

                promises.push(eventPromise);
            }
        }

        return this.executeSequentially(promises);
    }

    bind(handler: IEventHandler<IEvent>, eventId: string) {
        const logger = getLogger(QueueEventBus);
        if (isNil(this._handlerPairs)) {
            this._handlerPairs = [];
        }
        logger.log(`Binding event [${eventId}] to handler class [${handler.constructor.name}]`);
        this._handlerPairs.push({
            eventId: eventId,
            handler: handler
        });
    }

    onModuleDestroy() {
        super.onModuleDestroy();
        this._handlerPairs = [];
    }

    get handlerPairs(): Array<{ eventId: string; handler: IEventHandler<IEvent> }> {
        return this._handlerPairs.slice(0);
    }

    private async executeSequentially(promises: Array<() => Promise<unknown>>): Promise<unknown[]> {
        const results = [];
        const logger = getLogger(QueueEventBus);
        for (let i = 0; i < promises.length; i++) {
            try {
                results.push(await promises[i]());
            } catch (error) {
                logger.error(`Failed to execute sequential promise with error: ${(error as Error).message}`);
                throw error;
            }
        }

        return results;
    }
}
