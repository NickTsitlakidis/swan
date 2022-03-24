import { EventBus, IEventHandler } from "@nestjs/cqrs";
import { IEvent } from "@nestjs/cqrs/dist/interfaces";
import { find, isNil } from "lodash";
import { getLogger, LogAsyncMethod } from "./logging";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const promiseAllSequential = require("promise-all-sequential");

/**
 * A nestjs event bus that publishes all events sequentially.
 * Cases where the processing of an event depends on a previous, require sequential publishing.
 */
export class QueueEventBus<EventBase extends IEvent = IEvent> extends EventBus {
    private _handlerPairs: Array<{ eventName: string; handler: IEventHandler<IEvent> }>;

    private _logger = getLogger(QueueEventBus);

    publish<T extends IEvent>(event: T) {
        const found = find(this._handlerPairs, { eventName: this.getEventName(event) });
        if (isNil(found)) {
            return Promise.resolve();
        }

        return found.handler.handle(event);
    }

    @LogAsyncMethod
    publishAll<T extends IEvent>(events: T[]) {
        const withHandlers = events.filter((event) => {
            const found = find(this._handlerPairs, { eventName: this.getEventName(event) });
            return !isNil(found);
        });

        const promises = [];
        for (let i = 0; i < withHandlers.length; i++) {
            const event = withHandlers[i];
            const handlerMatches = this._handlerPairs.filter((pair) => pair.eventName === this.getEventName(event));
            for (let j = 0; j < handlerMatches.length; j++) {
                const eventPromise = async () =>
                    new Promise((resolve, reject) => {
                        handlerMatches[j].handler
                            .handle(event)
                            .then((handlerResult) => resolve(handlerResult))
                            .catch((error) => {
                                reject(error);
                            });
                    });

                promises.push(eventPromise);
            }
        }

        return promiseAllSequential(promises);
    }

    bind(handler: IEventHandler<IEvent>, name: string) {
        if (isNil(this._handlerPairs)) {
            this._handlerPairs = [];
        }
        this._logger.log(`Binding event [${name}] to handler`);
        this._handlerPairs.push({
            eventName: name,
            handler: handler
        });
    }

    onModuleDestroy() {
        super.onModuleDestroy();
        this._handlerPairs = [];
    }

    get handlerPairs(): Array<{ eventName: string; handler: IEventHandler<IEvent> }> {
        return this._handlerPairs.slice(0);
    }
}
