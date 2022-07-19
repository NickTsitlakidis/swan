import { TestingModule } from "@nestjs/testing";
import { getUnitTestingModule } from "../../test-utils/test-modules";
import { NotFoundException } from "@nestjs/common";
import { MintNftCommandExecutor } from "./mint-nft-command-executor";
import { NftViewRepository } from "../../views/nft/nft-view-repository";
import { EventStore } from "../../infrastructure/event-store";
import { NftFactory } from "../../domain/nft/nft-factory";
import { MintNftCommand } from "./mint-nft-command";
import { NftView } from "../../views/nft/nft-view";
import { SourcedEvent } from "../../infrastructure/sourced-event";
import { NftCreatedEvent } from "../../domain/nft/nft-events";
import { Nft } from "../../domain/nft/nft";
import { ObjectId } from "mongodb";

let testModule: TestingModule;
let executor: MintNftCommandExecutor;
let viewRepository: NftViewRepository;
let eventStore: EventStore;
let nftFactory: NftFactory;

beforeEach(async () => {
    testModule = await getUnitTestingModule(MintNftCommandExecutor);
    executor = testModule.get(MintNftCommandExecutor);
    viewRepository = testModule.get(NftViewRepository);
    eventStore = testModule.get(EventStore);
    nftFactory = testModule.get(NftFactory);
});

test("execute - throws not found exception in case the Nft does not exist on the DB", async () => {
    const command = new MintNftCommand();
    command.id = "id";
    command.tokenAddress = "tokenAddress";
    command.tokenId = "tokenId";
    command.userId = "user";
    command.transactionId = "transactionId";

    const viewRepositorySpy = jest.spyOn(viewRepository, "findByIdAndUserId").mockResolvedValue(undefined);

    await expect(executor.execute(command)).rejects.toThrow(NotFoundException);

    expect(viewRepositorySpy).toHaveBeenCalledTimes(1);
    expect(viewRepositorySpy).toHaveBeenCalledWith(command.id, command.userId);
});

test("execute - throws not found exception in case the Nft does not exist on the DB", async () => {
    const command = new MintNftCommand();
    command.id = "id";
    command.tokenAddress = "tokenAddress";
    command.tokenId = "tokenId";
    command.userId = "user";
    command.transactionId = "transactionId";

    const nftView = new NftView();
    nftView.id = new ObjectId().toHexString();

    const nft = Nft.create(command.id, command.userId, "chain-1");

    const sourcedEvents = [new SourcedEvent(command.id, new NftCreatedEvent(command.userId, "chain-id"))];

    const viewRepositorySpy = jest.spyOn(viewRepository, "findByIdAndUserId").mockResolvedValue(nftView);
    const eventStoreSpy = jest.spyOn(eventStore, "findEventByAggregateId").mockResolvedValue(sourcedEvents);
    const nftFactorySpy = jest.spyOn(nftFactory, "createFromEvents").mockReturnValue(nft);
    const nftMintSpy = jest.spyOn(nft, "mint").mockImplementation(() => {});
    const nftMintCommitSpy = jest.spyOn(nft, "commit").mockResolvedValue(nft);

    const result = await executor.execute(command);

    expect(viewRepositorySpy).toHaveBeenCalledTimes(1);
    expect(viewRepositorySpy).toHaveBeenCalledWith(command.id, command.userId);

    expect(eventStoreSpy).toHaveBeenCalledTimes(1);
    expect(eventStoreSpy).toHaveBeenCalledWith(command.id);

    expect(nftFactorySpy).toHaveBeenCalledTimes(1);
    expect(nftFactorySpy).toHaveBeenCalledWith(command.id, sourcedEvents);

    expect(nftMintSpy).toHaveBeenCalledTimes(1);
    expect(nftMintSpy).toHaveBeenCalledWith(command);

    expect(nftMintCommitSpy).toHaveBeenCalledTimes(1);

    expect(result.id).toBe(command.id);
    expect(result.version).toBe(0);
});
