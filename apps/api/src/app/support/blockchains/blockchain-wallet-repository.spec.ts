import { Collection } from "mongodb";
import { TestingModule } from "@nestjs/testing";
import { cleanUpMongo, getCollection, getMongoTestingModule } from "../../test-utils/test-modules";
import { BlockchainWalletRepository } from "./blockchain-wallet-repository";
import { BlockchainWallet } from "./blockchain-wallet";
import { instanceToPlain } from "class-transformer";
import { buildBlockchainWallet } from "../../test-utils/test-builders";

let repository: BlockchainWalletRepository;
let collection: Collection<any>;
let moduleRef: TestingModule;

beforeEach(async () => {
    moduleRef = await getMongoTestingModule(BlockchainWallet, BlockchainWalletRepository);

    repository = moduleRef.get(BlockchainWalletRepository);
    collection = getCollection("blockchain-wallets", moduleRef);
    await collection.deleteMany({});
});

afterEach(async () => {
    await cleanUpMongo(moduleRef);
});

test("findAll - returns no wallets for empty collection", async () => {
    const wallets = await repository.findAll();
    expect(wallets.length).toBe(0);
});

test("findAll - returns all blockchain wallets of collection", async () => {
    const w1 = buildBlockchainWallet();
    const w2 = buildBlockchainWallet();
    const w3 = buildBlockchainWallet();

    await collection.insertMany([instanceToPlain(w1), instanceToPlain(w2), instanceToPlain(w3)]);

    const wallets = await repository.findAll();
    expect(wallets.length).toBe(3);
    expect(wallets[0]).toMatchObject(w1);
    expect(wallets[1]).toMatchObject(w2);
    expect(wallets[2]).toMatchObject(w3);
});

test("findByWalletIdAndBlockchainId - returns matching wallet", async () => {
    const w1 = buildBlockchainWallet();
    const w2 = buildBlockchainWallet();
    const w3 = buildBlockchainWallet();

    await collection.insertMany([instanceToPlain(w1), instanceToPlain(w2), instanceToPlain(w3)]);

    const wallet = await repository.findByWalletIdAndBlockchainId(w2.walletId, w2.blockchainId);
    expect(wallet).toBeDefined();
    expect(wallet).toMatchObject(w2);
});

test("findByWalletIdAndBlockchainId - returns null for no blockchain match", async () => {
    const w1 = buildBlockchainWallet();
    const w2 = buildBlockchainWallet();
    const w3 = buildBlockchainWallet();

    await collection.insertMany([instanceToPlain(w1), instanceToPlain(w2), instanceToPlain(w3)]);

    const wallet = await repository.findByWalletIdAndBlockchainId(w2.walletId, "something-else");
    expect(wallet).toBeNull();
});

test("findByWalletIdAndBlockchainId - returns null for no wallet match", async () => {
    const w1 = buildBlockchainWallet();
    const w2 = buildBlockchainWallet();
    const w3 = buildBlockchainWallet();

    await collection.insertMany([instanceToPlain(w1), instanceToPlain(w2), instanceToPlain(w3)]);

    const wallet = await repository.findByWalletIdAndBlockchainId("other-thing", w2.blockchainId);
    expect(wallet).toBeNull();
});
