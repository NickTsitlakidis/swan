import { getUnitTestingModule } from "../test-utils/test-modules";
import { UserQueryHandler } from "./user-query-handler";
import { UserWalletViewRepository } from "../views/user-wallet/user-wallet-view-repository";
import { WalletRepository } from "../support/blockchains/wallet-repository";
import { TestingModule } from "@nestjs/testing";
import { Wallet } from "../support/blockchains/wallet";
import { UserWalletView } from "../views/user-wallet/user-wallet-view";
import { ObjectID } from "mongodb";
import { buildUserWalletView, buildWallet } from "../test-utils/test-builders";

let testModule: TestingModule;
let userWalletRepository: UserWalletViewRepository;
let walletRepository: WalletRepository;
let handler: UserQueryHandler;

beforeEach(async () => {
    testModule = await getUnitTestingModule(UserQueryHandler);
    walletRepository = testModule.get(WalletRepository);
    userWalletRepository = testModule.get(UserWalletViewRepository);
    handler = testModule.get(UserQueryHandler);
});

test("getUser - returns user with no wallets", async () => {
    const userWalletSpy = jest.spyOn(userWalletRepository, "findByUserId").mockResolvedValue([]);
    const walletsSpy = jest.spyOn(walletRepository, "findAll").mockResolvedValue([]);

    const user = await handler.getUser("user");
    expect(user).toBeDefined();
    expect(user.id).toBe("user");
    expect(user.wallets.length).toBe(0);

    expect(walletsSpy).toHaveBeenCalledTimes(1);
    expect(userWalletSpy).toHaveBeenCalledTimes(1);
    expect(userWalletSpy).toHaveBeenCalledWith("user");
});

test("getUser - skips wallet views that dont match wallets", async () => {
    const userWallets = [buildUserWalletView(), buildUserWalletView(), buildUserWalletView()];
    const wallets = [buildWallet(), buildWallet()];
    userWallets[0].walletId = wallets[0].id;
    userWallets[1].walletId = wallets[1].id;

    const userWalletSpy = jest.spyOn(userWalletRepository, "findByUserId").mockResolvedValue(userWallets);
    const walletsSpy = jest.spyOn(walletRepository, "findAll").mockResolvedValue(wallets);

    const user = await handler.getUser("user");
    expect(user).toBeDefined();
    expect(user.id).toBe("user");
    expect(user.wallets.length).toBe(2);
    expect(user.wallets[0].userId).toBe(userWallets[0].userId);
    expect(user.wallets[0].userWalletId).toBe(userWallets[0].id);
    expect(user.wallets[0].address).toBe(userWallets[0].address);
    expect(user.wallets[0].wallet.chainId).toBe(userWallets[0].blockchainId);
    expect(user.wallets[0].wallet.name).toBe(wallets[0].name);
    expect(user.wallets[0].wallet.id).toBe(wallets[0].id);
    expect(user.wallets[1].userId).toBe(userWallets[1].userId);
    expect(user.wallets[1].userWalletId).toBe(userWallets[1].id);
    expect(user.wallets[1].address).toBe(userWallets[1].address);
    expect(user.wallets[1].wallet.chainId).toBe(userWallets[1].blockchainId);
    expect(user.wallets[1].wallet.name).toBe(wallets[1].name);
    expect(user.wallets[1].wallet.id).toBe(wallets[1].id);

    expect(walletsSpy).toHaveBeenCalledTimes(1);
    expect(userWalletSpy).toHaveBeenCalledTimes(1);
    expect(userWalletSpy).toHaveBeenCalledWith("user");
});

test("getUserWallets - returns multiple wallets based on views", async () => {
    const wallets = [new Wallet(), new Wallet()];
    wallets[0].id = new ObjectID().toHexString();
    wallets[0].name = "the-first-wallet";
    wallets[1].id = new ObjectID().toHexString();
    wallets[1].name = "the-second-wallet";

    const userWallets = [new UserWalletView(), new UserWalletView()];
    userWallets[0].id = new ObjectID().toHexString();
    userWallets[0].walletId = wallets[0].id;
    userWallets[0].userId = "user";
    userWallets[0].address = "address1";
    userWallets[0].blockchainId = "block1";
    userWallets[1].id = new ObjectID().toHexString();
    userWallets[1].walletId = wallets[1].id;
    userWallets[1].userId = "user";
    userWallets[1].address = "address2";
    userWallets[1].blockchainId = "block2";

    const walletsSpy = jest.spyOn(walletRepository, "findAll").mockResolvedValue(wallets);
    const userWalletSpy = jest.spyOn(userWalletRepository, "findByUserId").mockResolvedValue(userWallets);

    const result = await handler.getUserWallets("user");

    expect(result.length).toBe(2);

    expect(result[0].address).toBe("address1");
    expect(result[0].userId).toBe("user");
    expect(result[0].userWalletId).toBe(userWallets[0].id);
    expect(result[0].wallet.name).toBe("the-first-wallet");
    expect(result[0].wallet.chainId).toBe("block1");
    expect(result[0].wallet.id).toBe(wallets[0].id);

    expect(result[1].address).toBe("address2");
    expect(result[1].userId).toBe("user");
    expect(result[1].userWalletId).toBe(userWallets[1].id);
    expect(result[1].wallet.name).toBe("the-second-wallet");
    expect(result[1].wallet.chainId).toBe("block2");
    expect(result[1].wallet.id).toBe(wallets[1].id);

    expect(walletsSpy).toHaveBeenCalledTimes(1);

    expect(userWalletSpy).toHaveBeenCalledTimes(1);
    expect(userWalletSpy).toHaveBeenCalledWith("user");
});

test("getUserWallets - returns empty array when there is no view", async () => {
    const wallets = [new Wallet(), new Wallet()];

    const walletsSpy = jest.spyOn(walletRepository, "findAll").mockResolvedValue(wallets);
    const userWalletSpy = jest.spyOn(userWalletRepository, "findByUserId").mockResolvedValue([]);

    const result = await handler.getUserWallets("user");

    expect(result.length).toBe(0);

    expect(walletsSpy).toHaveBeenCalledTimes(1);

    expect(userWalletSpy).toHaveBeenCalledTimes(1);
    expect(userWalletSpy).toHaveBeenCalledWith("user");
});
