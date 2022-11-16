import { Buyer } from "./buyer";
import {
    ListingActivatedEvent,
    ListingCanceledEvent,
    ListingCreatedEvent,
    ListingSoldEvent,
    ListingSubmittedEvent
} from "./listing-events";
import { Listing } from "./listing";
import { SourcedEvent } from "../../infrastructure/sourced-event";
import { ListingStatus } from "./listing-status";
import { CurrencyList } from "@swan/dto";
import { ApiException } from "../../infrastructure/api-exception";

test("fromEvents - can process ListingCreatedEvent", () => {
    const seller = new Buyer("user", "wallet", "address");
    const event = new ListingCreatedEvent(
        seller,
        34,
        "cat",
        "block",
        "image",
        "anim",
        "contract",
        "nft",
        "tokenId",
        "nftId",
        "market"
    );
    const model = Listing.fromEvents("l-id", [new SourcedEvent("l-id", event)]);

    expect(model.seller).toEqual(seller);
    expect(model.id).toBe("l-id");
    expect(model.blockchainId).toBe(event.blockchainId);
    expect(model.marketPlaceContractAddress).toBe(event.marketPlaceContractAddress);
    expect(model.categoryId).toBe(event.categoryId);
    expect(model.nftId).toBe(event.nftId);
    expect(model.status).toBe(ListingStatus.CREATED);
    expect(model.chainListingId).toBeUndefined();
    expect(model.price).toBe(event.price);
    expect(model.chainTokenId).toBe(event.chainTokenId);
    expect(model.animationUrl).toBe(event.animationUrl);
    expect(model.tokenContractAddress).toBe(model.tokenContractAddress);
    expect(model.buyer).toBeUndefined();
    expect(model.imageUrl).toBe(event.imageUrl);
    expect(model.transactionFee).toBeUndefined();
    expect(model.listingSoldTransaction).toBeUndefined();
    expect(model.listingCreatedTransaction).toBeUndefined();
    expect(model.nftAddress).toBe(event.nftAddress);
});

test("fromEvents - can process ListingSubmittedEvent", () => {
    const seller = new Buyer("user", "wallet", "address");
    const createdEvent = new ListingCreatedEvent(
        seller,
        34,
        "cat",
        "block",
        "image",
        "anim",
        "contract",
        "nft",
        "tokenId",
        "nftId",
        "market"
    );
    const model = Listing.fromEvents("l-id", [
        new SourcedEvent("l-id", createdEvent),
        new SourcedEvent("l-id", new ListingSubmittedEvent("the-hash"))
    ]);

    expect(model.id).toBe("l-id");
    expect(model.status).toBe(ListingStatus.SUBMITTED);
    expect(model.listingCreatedTransaction).toBeDefined();
    expect(model.listingCreatedTransaction.transactionHash).toEqual("the-hash");
});

test("fromEvents - can process ListingCanceledEvent", () => {
    const seller = new Buyer("user", "wallet", "address");
    const createdEvent = new ListingCreatedEvent(
        seller,
        34,
        "cat",
        "block",
        "image",
        "anim",
        "contract",
        "nft",
        "tokenId",
        "nftId",
        "market"
    );
    const model = Listing.fromEvents("l-id", [
        new SourcedEvent("l-id", createdEvent),
        new SourcedEvent("l-id", new ListingCanceledEvent(true))
    ]);

    expect(model.id).toBe("l-id");
    expect(model.status).toBe(ListingStatus.CANCELED);
});

test("fromEvents - can process ListingActivatedEvent", () => {
    const seller = new Buyer("user", "wallet", "address");
    const createdEvent = new ListingCreatedEvent(
        seller,
        34,
        "cat",
        "block",
        "image",
        "anim",
        "contract",
        "nft",
        "tokenId",
        "nftId",
        "market"
    );
    const model = Listing.fromEvents("l-id", [
        new SourcedEvent("l-id", createdEvent),
        new SourcedEvent("l-id", new ListingSubmittedEvent("the-hash")),
        new SourcedEvent("l-id", new ListingActivatedEvent(222, 333))
    ]);

    expect(model.id).toBe("l-id");
    expect(model.status).toBe(ListingStatus.ACTIVE);
    expect(model.listingCreatedTransaction).toBeDefined();
    expect(model.listingCreatedTransaction.blockNumber).toEqual(222);
    expect(model.chainListingId).toBe(333);
});

test("fromEvents - can process ListingSoldEvent", () => {
    const seller = new Buyer("user", "wallet", "address");
    const createdEvent = new ListingCreatedEvent(
        seller,
        34,
        "cat",
        "block",
        "image",
        "anim",
        "contract",
        "nft",
        "tokenId",
        "nftId",
        "market"
    );
    const model = Listing.fromEvents("l-id", [
        new SourcedEvent("l-id", createdEvent),
        new SourcedEvent("l-id", new ListingSubmittedEvent("the-hash")),
        new SourcedEvent("l-id", new ListingActivatedEvent(222, 333)),
        new SourcedEvent(
            "l-id",
            new ListingSoldEvent(
                "sale-hash",
                new Buyer("b-user", "b-wallet", "b-address"),
                { amount: 20, currency: CurrencyList.Ethereum },
                444
            )
        )
    ]);

    expect(model.id).toBe("l-id");
    expect(model.status).toBe(ListingStatus.SOLD);
    expect(model.listingSoldTransaction).toBeDefined();
    expect(model.listingSoldTransaction.blockNumber).toEqual(444);
    expect(model.listingSoldTransaction.transactionHash).toEqual("sale-hash");
    expect(model.transactionFee.amount).toBe(20);
    expect(model.transactionFee.currency).toBe(CurrencyList.Ethereum);
    expect(model.buyer).toEqual(new Buyer("b-user", "b-wallet", "b-address"));
});

test("activate - throws if not submitted", () => {
    const seller = new Buyer("user", "wallet", "address");
    const createdEvent = new ListingCreatedEvent(
        seller,
        34,
        "cat",
        "block",
        "image",
        "anim",
        "contract",
        "nft",
        "tokenId",
        "nftId",
        "market"
    );
    const model = Listing.fromEvents("l-id", [new SourcedEvent("l-id", createdEvent)]);

    expect(() => model.activate(34, 44)).toThrow(ApiException);
});

test("activate - sets properties and applies event", () => {
    const seller = new Buyer("user", "wallet", "address");
    const createdEvent = new ListingCreatedEvent(
        seller,
        34,
        "cat",
        "block",
        "image",
        "anim",
        "contract",
        "nft",
        "tokenId",
        "nftId",
        "market"
    );
    const model = Listing.fromEvents("l-id", [
        new SourcedEvent("l-id", createdEvent),
        new SourcedEvent("l-id", new ListingSubmittedEvent("the-hash"))
    ]);

    model.activate(34, 44);
    expect(model.listingCreatedTransaction.blockNumber).toBe(34);
    expect(model.chainListingId).toBe(44);
    expect(model.appliedEvents.length).toBe(1);
    expect(model.appliedEvents[0]).toBeInstanceOf(ListingActivatedEvent);
    expect((model.appliedEvents[0] as ListingActivatedEvent).chainListingId).toBe(44);
    expect((model.appliedEvents[0] as ListingActivatedEvent).blockNumber).toBe(34);
});

test("cancel - throws if not active", () => {
    const seller = new Buyer("user", "wallet", "address");
    const createdEvent = new ListingCreatedEvent(
        seller,
        34,
        "cat",
        "block",
        "image",
        "anim",
        "contract",
        "nft",
        "tokenId",
        "nftId",
        "market"
    );
    const model = Listing.fromEvents("l-id", [new SourcedEvent("l-id", createdEvent)]);

    expect(() => model.cancel(true)).toThrow(ApiException);
});

test("cancel - updates status and applies event", () => {
    const seller = new Buyer("user", "wallet", "address");
    const createdEvent = new ListingCreatedEvent(
        seller,
        34,
        "cat",
        "block",
        "image",
        "anim",
        "contract",
        "nft",
        "tokenId",
        "nftId",
        "market"
    );
    const model = Listing.fromEvents("l-id", [
        new SourcedEvent("l-id", createdEvent),
        new SourcedEvent("l-id", new ListingSubmittedEvent("the-hash")),
        new SourcedEvent("l-id", new ListingActivatedEvent(222, 333))
    ]);

    model.cancel(true);
    expect(model.appliedEvents.length).toBe(1);
    expect(model.appliedEvents[0]).toBeInstanceOf(ListingCanceledEvent);
    expect((model.appliedEvents[0] as ListingCanceledEvent).isInternal).toBe(true);
});

test("submitToChain - throws if not created", () => {
    const seller = new Buyer("user", "wallet", "address");
    const createdEvent = new ListingCreatedEvent(
        seller,
        34,
        "cat",
        "block",
        "image",
        "anim",
        "contract",
        "nft",
        "tokenId",
        "nftId",
        "market"
    );
    const model = Listing.fromEvents("l-id", [
        new SourcedEvent("l-id", createdEvent),
        new SourcedEvent("l-id", new ListingSubmittedEvent("the-hash"))
    ]);

    expect(() => model.submitToChain("hash")).toThrow(ApiException);
});

test("submitToChain - sets properties and applies event", () => {
    const seller = new Buyer("user", "wallet", "address");
    const createdEvent = new ListingCreatedEvent(
        seller,
        34,
        "cat",
        "block",
        "image",
        "anim",
        "contract",
        "nft",
        "tokenId",
        "nftId",
        "market"
    );
    const model = Listing.fromEvents("l-id", [new SourcedEvent("l-id", createdEvent)]);

    model.submitToChain("hash");

    expect(model.status).toBe(ListingStatus.SUBMITTED);
    expect(model.listingCreatedTransaction.transactionHash).toBe("hash");
    expect(model.appliedEvents.length).toBe(1);
    expect(model.appliedEvents[0]).toBeInstanceOf(ListingSubmittedEvent);
    expect((model.appliedEvents[0] as ListingSubmittedEvent).transactionHash).toBe("hash");
});
