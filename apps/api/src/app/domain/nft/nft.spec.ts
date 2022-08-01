import { BlockchainActionsService } from "./../../support/blockchains/blockchain-actions-service";
import { Nft } from "./nft";
import { NftCreatedEvent, NftMintedEvent, UploadedNftMetadataEvent } from "./nft-events";
import { NftStatus } from "./nft-status";
import { SourcedEvent } from "../../infrastructure/sourced-event";
import { MintNftCommand } from "../../commands/nft/mint-nft-command";
import { BadRequestException } from "@nestjs/common";
import { getUnitTestingModule } from "../../test-utils/test-modules";

let blockchainActionsMock: BlockchainActionsService;

beforeEach(async () => {
    const moduleRef = await getUnitTestingModule(BlockchainActionsService);
    blockchainActionsMock = moduleRef.get(BlockchainActionsService);
});

test("create - sets properties and applies NftCreatedEvent", () => {
    const nft = Nft.create(blockchainActionsMock, "the-id", "the-user", "the-chain");

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
    const nft = Nft.fromEvents(blockchainActionsMock, "the-id", [new SourcedEvent("the-id", event)]);

    expect(nft.userId).toBe("the-user");
    expect(nft.blockchainId).toBe("the-chain");
    expect(nft.status).toBe(NftStatus.CREATED);
    expect(nft.id).toBe("the-id");
});

test("fromEvents - can process NftMintedEvent", () => {
    const event = new NftMintedEvent(NftStatus.MINTED, "transaction-1", "adress-1", "token-1");
    const nft = Nft.fromEvents(blockchainActionsMock, "the-id", [new SourcedEvent("the-id", event)]);

    expect(nft.status).toBe(NftStatus.MINTED);
    expect(nft.id).toBe("the-id");
});

test("mint - returns bad request when status is not UPLOADED_FILES", () => {
    const nft = Nft.create(blockchainActionsMock, "the-id", "the-user", "the-chain");
    const command = new MintNftCommand();
    command.id = "id";
    command.tokenAddress = "tokenAddress";
    command.tokenId = "tokenId";
    command.userId = "user";
    command.transactionId = "transactionId";

    expect(() => nft.mint(command)).toThrow(BadRequestException);
});

test("mint - successfully aplies the event to the store", () => {
    const sourcedEvents = [
        new SourcedEvent("nft-id", new NftCreatedEvent("user-1", "chain-id")),
        new SourcedEvent("nft-id", new UploadedNftMetadataEvent(NftStatus.UPLOADED_FILES, "metadata-uri", "image-uri"))
    ];
    const nft = Nft.fromEvents(blockchainActionsMock, "nft-id", sourcedEvents);

    const command = new MintNftCommand();
    command.id = "nft-id";
    command.tokenAddress = "tokenAddress";
    command.tokenId = "tokenId";
    command.userId = "user";
    command.transactionId = "transactionId";

    const nftMintedEvent = new NftMintedEvent(NftStatus.MINTED, "transactionId", "tokenAddress", "tokenId");
    nftMintedEvent.aggregateId = "nft-id";

    nft.mint(command);

    expect(nft.status).toBe(NftStatus.MINTED);
    expect(nft.appliedEvents[0]).toEqual(nftMintedEvent);
    expect(nft.appliedEvents.length).toBe(1);
});
