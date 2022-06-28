import { Nft } from "./nft";
import { NftCreatedEvent } from "./nft-events";
import { NftStatus } from "./nft-status";
import { SourcedEvent } from "../../infrastructure/sourced-event";

test("create - sets properties and applies NftCreatedEvent", () => {
    const nft = Nft.create("the-id", "the-user", "the-chain");

    expect(nft.appliedEvents.length).toBe(1);
    expect(nft.appliedEvents[0]).toBeInstanceOf(NftCreatedEvent);
    expect((nft.appliedEvents[0] as NftCreatedEvent).blockchainId).toBe("the-chain");
    expect((nft.appliedEvents[0] as NftCreatedEvent).userId).toBe("the-user");
    expect((nft.appliedEvents[0] as NftCreatedEvent).aggregateId).toBe("the-id");

    expect(nft.userId).toBe("the-user");
    expect(nft.blockchainId).toBe("the-chain");
    expect(nft.status).toBe(NftStatus.CREATED);
    expect(nft.id).toBe("the-id");
});

test("fromEvents - can process NftCreatedEvent", () => {
    const event = new NftCreatedEvent("the-user", "the-chain");
    const nft = Nft.fromEvents("the-id", [new SourcedEvent("the-id", event)]);

    expect(nft.userId).toBe("the-user");
    expect(nft.blockchainId).toBe("the-chain");
    expect(nft.status).toBe(NftStatus.CREATED);
    expect(nft.id).toBe("the-id");
});
