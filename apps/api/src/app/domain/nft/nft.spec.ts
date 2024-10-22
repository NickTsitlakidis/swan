import { Nft } from "./nft";
import { NftChangeUserEvent, NftCreatedEvent, NftMintedEvent, UploadedNftMetadataEvent } from "./nft-events";
import { NftStatus } from "./nft-status";
import { SourcedEvent } from "../../infrastructure/sourced-event";
import { MintNftCommand } from "../../commands/nft/mint-nft-command";
import { BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { BlockchainActionsRegistryService } from "../../support/blockchains/blockchain-actions-registry-service";
import { createMock } from "@golevelup/ts-jest";
import { NftMetadata } from "./nft-metadata";
import { EvmActionsService } from "../../support/blockchains/evm-actions-service";
import { NftCreateExternal } from "./nft-create-external";

test("create - sets properties and applies NftCreatedEvent", () => {
    const nft = Nft.create("the-id", "the-user", "the-chain", "category", "wallet");

    expect(nft.appliedEvents.length).toBe(1);
    expect(nft.appliedEvents[0]).toBeInstanceOf(NftCreatedEvent);
    expect((nft.appliedEvents[0] as NftCreatedEvent).blockchainId).toBe("the-chain");
    expect((nft.appliedEvents[0] as NftCreatedEvent).categoryId).toBe("category");
    expect((nft.appliedEvents[0] as NftCreatedEvent).userId).toBe("the-user");
    expect((nft.appliedEvents[0] as NftCreatedEvent).userWalletId).toBe("wallet");
    expect((nft.appliedEvents[0] as NftCreatedEvent).aggregateId).toBe("the-id");

    expect(nft.userId).toBe("the-user");
    expect(nft.blockchainId).toBe("the-chain");
    expect(nft.status).toBe(NftStatus.CREATED);
    expect(nft.userWalletId).toBe("wallet");
    expect(nft.id).toBe("the-id");
});

test("createExternal - sets properties and applies NftCreatedEvent & NftMintedEvent", () => {
    const nftExternal: NftCreateExternal = {
        blockchainId: "the-chain",
        categoryId: "category",
        userWalletId: "wallet",
        tokenId: "333",
        tokenAddress: "address",
        transactionId: "transactionId"
    };
    const nft = Nft.createExternal("the-id", "the-user", nftExternal);

    expect(nft.appliedEvents.length).toBe(2);
    expect(nft.appliedEvents[0]).toBeInstanceOf(NftCreatedEvent);
    expect((nft.appliedEvents[0] as NftCreatedEvent).blockchainId).toBe("the-chain");
    expect((nft.appliedEvents[0] as NftCreatedEvent).categoryId).toBe("category");
    expect((nft.appliedEvents[0] as NftCreatedEvent).userId).toBe("the-user");
    expect((nft.appliedEvents[0] as NftCreatedEvent).userWalletId).toBe("wallet");
    expect((nft.appliedEvents[0] as NftCreatedEvent).aggregateId).toBe("the-id");

    expect((nft.appliedEvents[1] as NftMintedEvent).tokenId).toBe("333");
    expect((nft.appliedEvents[1] as NftMintedEvent).tokenAddress).toBe("address");
    expect((nft.appliedEvents[1] as NftMintedEvent).transactionId).toBe("transactionId");

    expect(nft.userId).toBe("the-user");
    expect(nft.blockchainId).toBe("the-chain");
    expect(nft.status).toBe(NftStatus.MINTED);
    expect(nft.userWalletId).toBe("wallet");
    expect(nft.id).toBe("the-id");
});

test("fromEvents - can process NftCreatedEvent", () => {
    const event = new NftCreatedEvent("the-user", "the-chain", "category", "wallet");
    const nft = Nft.fromEvents("the-id", [new SourcedEvent("the-id", event)]);

    expect(nft.userId).toBe("the-user");
    expect(nft.blockchainId).toBe("the-chain");
    expect(nft.categoryId).toBe("category");
    expect(nft.status).toBe(NftStatus.CREATED);
    expect(nft.userWalletId).toBe("wallet");
    expect(nft.id).toBe("the-id");
});

test("fromEvents - can process NftMintedEvent", () => {
    const event = new NftMintedEvent("transaction-1", "adress-1", "token-1");
    const nft = Nft.fromEvents("the-id", [new SourcedEvent("the-id", event)]);

    expect(nft.status).toBe(NftStatus.MINTED);
    expect(nft.id).toBe("the-id");
});

test("mint - returns bad request when status is not UPLOADED_FILES", () => {
    const nft = Nft.create("the-id", "the-user", "the-chain", "category", "wallet");
    const command = new MintNftCommand();
    command.id = "id";
    command.tokenContractAddress = "tokenAddress";
    command.tokenId = "tokenId";
    command.userId = "user";
    command.transactionId = "transactionId";

    expect(() => nft.mint(command)).toThrow(BadRequestException);
});

test("mint - successfully applies the event to the store", () => {
    const sourcedEvents = [
        new SourcedEvent("nft-id", new NftCreatedEvent("user-1", "chain-id", "category", "wallet")),
        new SourcedEvent("nft-id", new UploadedNftMetadataEvent("metadata-uri", "image-uri"))
    ];
    const nft = Nft.fromEvents("nft-id", sourcedEvents);

    const command = new MintNftCommand();
    command.id = "nft-id";
    command.tokenContractAddress = "tokenAddress";
    command.tokenId = "tokenId";
    command.userId = "user";
    command.transactionId = "transactionId";

    const nftMintedEvent = new NftMintedEvent("transactionId", "tokenAddress", "tokenId");
    nftMintedEvent.aggregateId = "nft-id";

    nft.mint(command);

    expect(nft.status).toBe(NftStatus.MINTED);
    expect(nft.appliedEvents[0]).toEqual(nftMintedEvent);
    expect(nft.appliedEvents.length).toBe(1);
});

test("changeUser - successfully changes user of the nft", () => {
    const sourcedEvents = [
        new SourcedEvent("nft-id", new NftCreatedEvent("user-1", "chain-id", "category", "wallet")),
        new SourcedEvent("nft-id", new UploadedNftMetadataEvent("metadata-uri", "image-uri"))
    ];
    const nft = Nft.fromEvents("nft-id", sourcedEvents);

    const newUser = "user-2";
    const userWalletId = "wallet-2";

    expect(() => nft.changeUser(newUser, userWalletId)).toThrow(BadRequestException);
});

test("changeUser - successfully changes user of the nft", () => {
    const sourcedEvents = [
        new SourcedEvent("nft-id", new NftCreatedEvent("user-1", "chain-id", "category", "wallet")),
        new SourcedEvent("nft-id", new UploadedNftMetadataEvent("metadata-uri", "image-uri")),
        new SourcedEvent("nft-id", new NftMintedEvent("transactionId", "address", "555"))
    ];
    const nft = Nft.fromEvents("nft-id", sourcedEvents);

    const newUser = "user-2";
    const userWalletId = "wallet-2";

    const nftChangeUserEvent = new NftChangeUserEvent(newUser, userWalletId);
    nftChangeUserEvent.aggregateId = "nft-id";

    nft.changeUser(newUser, userWalletId);

    expect(nft.status).toBe(NftStatus.MINTED);
    expect(nft.appliedEvents[0]).toEqual(nftChangeUserEvent);
    expect(nft.appliedEvents.length).toBe(1);
});

test("uploadFiles - throws bad request when nft has already uploaded files", async () => {
    const sourcedEvents = [
        new SourcedEvent("nft-id", new NftCreatedEvent("user-1", "chain-id", "category", "wallet")),
        new SourcedEvent("nft-id", new UploadedNftMetadataEvent("metadata-uri", "image-uri"))
    ];
    const nft = Nft.fromEvents("nft-id", sourcedEvents);

    const registry = createMock<BlockchainActionsRegistryService>();
    const metadata = new NftMetadata();
    await expect(nft.uploadFiles(registry, metadata)).rejects.toThrow(BadRequestException);
});

test("uploadFiles - uploads files and applies UploadedNftMetadataEvent", async () => {
    const sourcedEvents = [new SourcedEvent("nft-id", new NftCreatedEvent("user-1", "chain-id", "category", "wallet"))];
    const nft = Nft.fromEvents("nft-id", sourcedEvents);

    const registry = createMock<BlockchainActionsRegistryService>();
    const actionsService = createMock<EvmActionsService>();

    const registrySpy = jest.spyOn(registry, "getService").mockResolvedValue(actionsService);
    const evmSpy = jest
        .spyOn(actionsService, "uploadMetadata")
        .mockResolvedValue({ metadataIPFSUri: "meta-ipfs", imageIPFSUri: "image-ipfs" });

    const metadata = new NftMetadata();

    await nft.uploadFiles(registry, metadata);

    expect(nft.status).toBe(NftStatus.UPLOADED_FILES);
    expect(nft.metadataUri).toBe("meta-ipfs");

    expect(nft.appliedEvents.length).toBe(1);
    expect(nft.appliedEvents[0]).toBeInstanceOf(UploadedNftMetadataEvent);
    expect((nft.appliedEvents[0] as UploadedNftMetadataEvent).metadataUri).toBe("meta-ipfs");
    expect((nft.appliedEvents[0] as UploadedNftMetadataEvent).imageUri).toBe("image-ipfs");
    expect((nft.appliedEvents[0] as UploadedNftMetadataEvent).aggregateId).toBe("nft-id");

    expect(registrySpy).toHaveBeenCalledWith("chain-id");
    expect(registrySpy).toHaveBeenCalledTimes(1);

    expect(evmSpy).toHaveBeenCalledWith(metadata);
    expect(evmSpy).toHaveBeenCalledTimes(1);
});

test("uploadFiles - throws internal server error if registry returns no service", async () => {
    const sourcedEvents = [new SourcedEvent("nft-id", new NftCreatedEvent("user-1", "chain-id", "category", "wallet"))];
    const nft = Nft.fromEvents("nft-id", sourcedEvents);

    const registry = createMock<BlockchainActionsRegistryService>();

    const registrySpy = jest.spyOn(registry, "getService").mockResolvedValue(undefined);

    const metadata = new NftMetadata();

    await expect(nft.uploadFiles(registry, metadata)).rejects.toThrow(InternalServerErrorException);

    expect(nft.status).toBe(NftStatus.CREATED);
    expect(nft.appliedEvents.length).toBe(0);

    expect(registrySpy).toHaveBeenCalledWith("chain-id");
    expect(registrySpy).toHaveBeenCalledTimes(1);
});
