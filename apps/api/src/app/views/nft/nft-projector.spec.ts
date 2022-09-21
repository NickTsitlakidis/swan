import { ObjectId } from "mongodb";
import { getUnitTestingModule } from "../../test-utils/test-modules";
import { NftViewRepository } from "./nft-view-repository";
import { NftProjector } from "./nft-projector";
import { NftView } from "./nft-view";
import { NftCreatedEvent, NftMintedEvent, UploadedNftMetadataEvent } from "../../domain/nft/nft-events";

let repositoryMock: NftViewRepository;
let projector: NftProjector;

beforeEach(async () => {
    const moduleRef = await getUnitTestingModule(NftProjector);

    projector = moduleRef.get(NftProjector);
    repositoryMock = moduleRef.get(NftViewRepository);
});

test("handle NftCreatedEvent - Saves new NftView", async () => {
    const saved = new NftView();
    const saveSpy = jest.spyOn(repositoryMock, "save").mockResolvedValue(saved);

    const id = new ObjectId().toHexString();
    const userId = "user-1";
    const chainId = "chain-1";
    const categoryId = "category";
    const walletId = "wallet";
    const event = new NftCreatedEvent(userId, chainId, categoryId, walletId);
    event.aggregateId = id;
    const handled = await projector.handle(event);

    expect(handled).toBe(saved);

    const expectedSaved = new NftView();
    expectedSaved.id = id;
    expectedSaved.userId = userId;
    expectedSaved.blockchainId = chainId;
    expectedSaved.categoryId = categoryId;
    expectedSaved.userWalletId = walletId;
    delete expectedSaved.createdAt;

    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining(expectedSaved));
});

test("handle UploadedNftMetadataEvent - Updates NftView with uploaded files event", async () => {
    const saved = new NftView();
    const id = new ObjectId().toHexString();
    saved.id = id;
    const findSpy = jest.spyOn(repositoryMock, "findById").mockResolvedValue(saved);
    const saveSpy = jest.spyOn(repositoryMock, "save").mockResolvedValue(saved);

    const metadataUri = "metadataUri";
    const fileUri = "fileUri";
    const event = new UploadedNftMetadataEvent(metadataUri, fileUri);
    event.aggregateId = id;
    const handled = await projector.handle(event);

    expect(handled).toBe(saved);

    const expectedSaved = new NftView();
    expectedSaved.id = id;
    expectedSaved.metadataUri = metadataUri;
    expectedSaved.fileUri = fileUri;
    delete expectedSaved.createdAt;

    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(findSpy).toHaveBeenCalledWith(event.aggregateId);
    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining(expectedSaved));
});

test("handle UploadedNftMetadataEvent - Skip save when NftView was not found", async () => {
    const saved = new NftView();
    const id = new ObjectId().toHexString();
    saved.id = id;
    const findSpy = jest.spyOn(repositoryMock, "findById").mockResolvedValue(undefined);
    const saveSpy = jest.spyOn(repositoryMock, "save").mockResolvedValue(saved);

    const metadataUri = "metadataUri";
    const fileUri = "fileUri";
    const event = new UploadedNftMetadataEvent(metadataUri, fileUri);
    event.aggregateId = id;
    const handled = await projector.handle(event);

    expect(handled).toBe(undefined);

    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(findSpy).toHaveBeenCalledWith(event.aggregateId);
    expect(saveSpy).toHaveBeenCalledTimes(0);
});

test("handle NftMintedEvent - Updates NftView with minted event", async () => {
    const saved = new NftView();
    const id = new ObjectId().toHexString();
    saved.id = id;
    const findSpy = jest.spyOn(repositoryMock, "findById").mockResolvedValue(saved);
    const saveSpy = jest.spyOn(repositoryMock, "save").mockResolvedValue(saved);

    const transactionId = "transactionId";
    const tokenId = "tokenId";
    const tokenAddress = "tokenAddress";
    const event = new NftMintedEvent(transactionId, tokenAddress, tokenId);
    event.aggregateId = id;
    const handled = await projector.handle(event);

    expect(handled).toBe(saved);

    const expectedSaved = new NftView();
    expectedSaved.id = id;
    expectedSaved.transactionId = transactionId;
    expectedSaved.tokenContractAddress = tokenAddress;
    expectedSaved.tokenId = tokenId;
    delete expectedSaved.createdAt;

    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(findSpy).toHaveBeenCalledWith(event.aggregateId);
    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining(expectedSaved));
});
