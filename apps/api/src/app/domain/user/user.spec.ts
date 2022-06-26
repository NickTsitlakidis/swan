import { User } from "./user";
import { UserWallet } from "./user-wallet";
import { UserCreatedEvent, WalletAddedEvent } from "./user-events";
import { SourcedEvent } from "../../infrastructure/sourced-event";
import { BadRequestException } from "@nestjs/common";

test("create - sets properties and applies event", () => {
    const wallet = new UserWallet("uw-id", "addr", "b-id", "w-id");
    const u = User.create("u-id", wallet);

    expect(u.id).toBe("u-id");
    expect(u.wallets.length).toBe(1);
    expect(u.wallets[0]).toEqual(wallet);
    expect(u.appliedEvents.length).toBe(1);
    expect(u.appliedEvents[0]).toBeInstanceOf(UserCreatedEvent);
    expect(u.appliedEvents[0].aggregateId).toBe(u.id);
    expect((u.appliedEvents[0] as UserCreatedEvent).wallet).toEqual(wallet);
});

test("fromEvents - can process UserCreatedEvent", () => {
    const wallet = new UserWallet("uw-id", "addr", "b-id", "w-id");
    const event = new UserCreatedEvent(wallet);
    const u = User.fromEvents("u-id", [new SourcedEvent("u-id", event)]);

    expect(u.id).toBe("u-id");
    expect(u.wallets.length).toBe(1);
    expect(u.wallets[0]).toEqual(wallet);
});

test("fromEvents - can process WalletAddedEvent", () => {
    const wallet1 = new UserWallet("uw-id", "addr", "b-id", "w-id");
    const event1 = new UserCreatedEvent(wallet1);

    const wallet2 = new UserWallet("uw-id", "addr2", "b-id2", "w-id2");
    const event2 = new WalletAddedEvent(wallet2);
    const u = User.fromEvents("u-id", [
        new SourcedEvent("u-id", event1),
        new SourcedEvent("u-id", event2)
    ]);

    expect(u.id).toBe("u-id");
    expect(u.wallets.length).toBe(2);
    expect(u.wallets[1]).toEqual(wallet2);
});

test("addWallet - throws for duplicate wallets", () => {
    const wallet = new UserWallet("uw-id", "addr", "b-id", "w-id");
    const event = new UserCreatedEvent(wallet);
    const u = User.fromEvents("u-id", [new SourcedEvent("u-id", event)]);

    expect(() => u.addWallet(wallet)).toThrow(BadRequestException);
});

test("addWallet - adds new wallet if not duplicate", () => {
    const wallet = new UserWallet("uw-id", "addr", "b-id", "w-id");
    const event = new UserCreatedEvent(wallet);
    const u = User.fromEvents("u-id", [new SourcedEvent("u-id", event)]);

    const newWallet = new UserWallet("new-uw", "new-addr", "new-b-id", "new-w-id");
    u.addWallet(newWallet);
    expect(u.wallets.length).toBe(2);
    expect(u.wallets[0]).toEqual(wallet);
    expect(u.wallets[1]).toEqual(newWallet);
});