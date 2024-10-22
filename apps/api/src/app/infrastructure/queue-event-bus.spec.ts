import { QueueEventBus } from "./queue-event-bus";
import { CommandBus, IEventHandler } from "@nestjs/cqrs";
import { IEvent } from "@nestjs/cqrs/dist/interfaces";
import { firstValueFrom, of, switchMap, throwError, timer } from "rxjs";
import { EVENT_METADATA } from "@nestjs/cqrs/dist/decorators/constants";
import { createMock } from "@golevelup/ts-jest";
import { ModuleRef } from "@nestjs/core";

class TestEvent1 implements IEvent {}

class TestEvent2 implements IEvent {}

test("onModuleDestroy - removes pairs", () => {
    const bus = new QueueEventBus(createMock<CommandBus>(), createMock<ModuleRef>());

    const handler: IEventHandler<TestEvent1> = {
        handle: () => undefined
    };

    bus.bind(handler, TestEvent1.name);

    bus.onModuleDestroy();
    expect(bus.handlerPairs.length).toBe(0);
});

test("bind - adds pair", () => {
    const bus = new QueueEventBus(createMock<CommandBus>(), createMock<ModuleRef>());

    const handler: IEventHandler<TestEvent1> = {
        handle: () => undefined
    };

    bus.bind(handler, "ev1");

    expect(bus.handlerPairs.length).toBe(1);
    expect(bus.handlerPairs[0].handler).toBe(handler);
    expect(bus.handlerPairs[0].eventId).toBe("ev1");
});

test("bind - adds multiple pairs", () => {
    const bus = new QueueEventBus(createMock<CommandBus>(), createMock<ModuleRef>());

    const handler: IEventHandler<TestEvent1> = {
        handle: () => undefined
    };

    const handler2: IEventHandler<TestEvent2> = {
        handle: () => undefined
    };

    bus.bind(handler, "ev1");
    bus.bind(handler2, "ev2");

    expect(bus.handlerPairs.length).toEqual(2);
    expect(bus.handlerPairs[0].handler).toBe(handler);
    expect(bus.handlerPairs[0].eventId).toBe("ev1");

    expect(bus.handlerPairs[1].handler).toBe(handler2);
    expect(bus.handlerPairs[1].eventId).toBe("ev2");
});

test("publish - resolves empty when event doesnt match", async () => {
    const bus = new QueueEventBus(createMock<CommandBus>(), createMock<ModuleRef>());

    let called = false;
    const handler: IEventHandler<TestEvent2> = {
        handle: () => {
            called = true;
        }
    };

    bus.bind(handler, TestEvent2.name);

    const result = await bus.publish(new TestEvent1());
    expect(result).toBeUndefined();
    expect(called).toBe(false);
});

test("publish - resolves when matched", async () => {
    const bus = new QueueEventBus(createMock<CommandBus>(), createMock<ModuleRef>());

    let calledWith = undefined;
    const handler: IEventHandler<TestEvent1> = {
        handle: (event: TestEvent1) => {
            calledWith = event;
            return true;
        }
    };

    bus.bind(handler, "ev1");

    const e = new TestEvent1();
    Reflect.defineMetadata(EVENT_METADATA, { id: "ev1" }, TestEvent1);
    const result = await bus.publish(e);
    expect(result).toBe(true);
    expect(calledWith).toBe(e);
});

test("publishAll - ignores events without handlers", async () => {
    const bus = new QueueEventBus(createMock<CommandBus>(), createMock<ModuleRef>());

    const handlerParameters: Array<TestEvent1> = [];

    const handler: IEventHandler<TestEvent1> = {
        handle: (event: TestEvent1) => {
            return firstValueFrom(
                timer(2000).pipe(
                    switchMap(() => {
                        handlerParameters.push(event);
                        return of(true);
                    })
                )
            );
        }
    };

    bus.bind(handler, "ev1");

    const e = new TestEvent1();
    const e2 = new TestEvent2();

    Reflect.defineMetadata(EVENT_METADATA, { id: "ev1" }, TestEvent1);
    Reflect.defineMetadata(EVENT_METADATA, { id: "ev2" }, TestEvent2);
    const results: Array<unknown> = await bus.publishAll([e2, e]);

    expect(handlerParameters.length).toBe(1);
    expect(handlerParameters[0]).toEqual(e2);
    expect(results.every((i) => i)).toBe(true);
});

test("publishAll - stops after error on handler", (endTest) => {
    const bus = new QueueEventBus(createMock<CommandBus>(), createMock<ModuleRef>());

    const handlerParameters = [];
    const handler1: IEventHandler<TestEvent1> = {
        handle: (event: TestEvent1) => {
            return firstValueFrom(
                timer(500).pipe(
                    switchMap(() => {
                        if (handlerParameters.length === 0) {
                            return throwError(() => "error");
                        }
                        handlerParameters.push(event);
                        return of(true);
                    })
                )
            );
        }
    };

    const handler2: IEventHandler<TestEvent2> = {
        handle: (event: TestEvent2) => {
            handlerParameters.push(event);
            return Promise.reject("oops");
        }
    };

    bus.bind(handler1, "ev1");
    bus.bind(handler2, "ev2");

    Reflect.defineMetadata(EVENT_METADATA, { id: "ev1" }, TestEvent1);
    Reflect.defineMetadata(EVENT_METADATA, { id: "ev2" }, TestEvent2);
    const e = new TestEvent1();
    const e2 = new TestEvent2();

    bus.publishAll([e2, e]).catch(() => {
        expect(handlerParameters.length).toBe(1);
        endTest();
    });
});

test("publishAll - runs all handlers sequentially when all match", async () => {
    const bus = new QueueEventBus(createMock<CommandBus>(), createMock<ModuleRef>());

    const handlerParameters: Array<TestEvent1> = [];

    const handler1: IEventHandler<TestEvent1> = {
        handle: (event: TestEvent1) => {
            return firstValueFrom(
                timer(500).pipe(
                    switchMap(() => {
                        if (handlerParameters.length === 0) {
                            return throwError(() => "error");
                        }
                        handlerParameters.push(event);
                        return of(true);
                    })
                )
            );
        }
    };

    const handler2: IEventHandler<TestEvent2> = {
        handle: (event: TestEvent2) => {
            return firstValueFrom(
                timer(2000).pipe(
                    switchMap(() => {
                        handlerParameters.push(event);
                        return of(true);
                    })
                )
            );
        }
    };

    bus.bind(handler2, "ev2");
    bus.bind(handler1, "ev1");

    Reflect.defineMetadata(EVENT_METADATA, { id: "ev1" }, TestEvent1);
    Reflect.defineMetadata(EVENT_METADATA, { id: "ev2" }, TestEvent2);

    const e = new TestEvent1();
    const e2 = new TestEvent2();
    const results: Array<unknown> = await bus.publishAll([e2, e]);

    expect(handlerParameters.length).toBe(2);
    expect(handlerParameters[0]).toEqual(e2);
    expect(handlerParameters[1]).toEqual(e);
    expect(results.every((i) => i)).toBe(true);
    expect(results.length).toBe(2);
});

test("publishAll - runs multiple handlers for the same event", async () => {
    const bus = new QueueEventBus(createMock<CommandBus>(), createMock<ModuleRef>());

    const handlerParameters: string[] = [];
    const handler1: IEventHandler<TestEvent1> = {
        handle: () => {
            return firstValueFrom(
                timer(500).pipe(
                    switchMap(() => {
                        handlerParameters.push("1");
                        return of(true);
                    })
                )
            );
        }
    };

    const handler2: IEventHandler<TestEvent1> = {
        handle: () => {
            return firstValueFrom(
                timer(500).pipe(
                    switchMap(() => {
                        handlerParameters.push("2");
                        return of(true);
                    })
                )
            );
        }
    };

    bus.bind(handler1, "ev1");
    bus.bind(handler2, "ev1");

    Reflect.defineMetadata(EVENT_METADATA, { id: "ev1" }, TestEvent1);

    const e = new TestEvent1();
    const results: Array<unknown> = await bus.publishAll([e]);

    expect(handlerParameters.length).toBe(2);
    expect(handlerParameters[0]).toEqual("1");
    expect(handlerParameters[1]).toEqual("2");
    expect(results.every((i) => i)).toBe(true);
    expect(results.length).toBe(2);
});
