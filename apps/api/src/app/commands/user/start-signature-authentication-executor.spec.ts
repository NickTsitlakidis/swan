import { IdGenerator } from "../../infrastructure/id-generator";
import { SignatureAuthenticationRepository } from "../../security/signature-authentication-repository";
import { ConfigService } from "@nestjs/config";
import { StartSignatureAuthenticationExecutor } from "./start-signature-authentication-executor";
import { StartSignatureAuthenticationCommand } from "./start-signature-authentication-command";
import { SignatureAuthentication } from "../../security/signature-authentication";
import { BadRequestException } from "@nestjs/common";
import { WalletRepository } from "../../support/blockchains/wallet-repository";
import { BlockchainWalletRepository } from "../../support/blockchains/blockchain-wallet-repository";
import { Wallet } from "../../support/blockchains/wallet";
import { BlockchainWallet } from "../../support/blockchains/blockchain-wallet";
import { getUnitTestingModule } from "../../test-utils/test-modules";

let idGeneratorMock: IdGenerator;
let authenticationRepoMock: SignatureAuthenticationRepository;
let walletRepoMock: WalletRepository;
let chainWalletRepoMock: BlockchainWalletRepository;
let configServiceMock: ConfigService;
let executor: StartSignatureAuthenticationExecutor;

beforeEach(async () => {
    const moduleRef = await getUnitTestingModule(StartSignatureAuthenticationExecutor);
    authenticationRepoMock = moduleRef.get(SignatureAuthenticationRepository);
    idGeneratorMock = moduleRef.get(IdGenerator);
    walletRepoMock = moduleRef.get(WalletRepository);
    chainWalletRepoMock = moduleRef.get(BlockchainWalletRepository);
    configServiceMock = moduleRef.get(ConfigService);
    executor = moduleRef.get(StartSignatureAuthenticationExecutor);
});

test("execute - throws for invalid combination", async () => {
    const chainWalletSpy = jest
        .spyOn(chainWalletRepoMock, "findByWalletIdAndBlockchainId")
        .mockResolvedValue(undefined);

    const command = new StartSignatureAuthenticationCommand();
    command.blockchainId = "b-id";
    command.address = "the-address";
    command.walletId = "w-id";

    await expect(executor.execute(command)).rejects.toThrow(BadRequestException);

    expect(chainWalletSpy).toHaveBeenCalledTimes(1);
    expect(chainWalletSpy).toHaveBeenCalledWith("w-id", "b-id");
});

test("execute - throws for non-signature wallet", async () => {
    const wallet = new Wallet();
    wallet.supportsSignatureAuthentication = false;
    const walletSpy = jest.spyOn(walletRepoMock, "findById").mockResolvedValue(wallet);

    const pair = new BlockchainWallet();
    pair.walletId = "w-id";
    const chainWalletSpy = jest.spyOn(chainWalletRepoMock, "findByWalletIdAndBlockchainId").mockResolvedValue(pair);

    const command = new StartSignatureAuthenticationCommand();
    command.blockchainId = "b-id";
    command.address = "the-address";
    command.walletId = "w-id";

    await expect(executor.execute(command)).rejects.toThrow(BadRequestException);

    expect(chainWalletSpy).toHaveBeenCalledTimes(1);
    expect(chainWalletSpy).toHaveBeenCalledWith("w-id", "b-id");

    expect(walletSpy).toHaveBeenCalledTimes(1);
    expect(walletSpy).toHaveBeenCalledWith("w-id");
});

test("execute - builds and saves authentication after deleting previous", async () => {
    const wallet = new Wallet();
    wallet.supportsSignatureAuthentication = true;
    const walletSpy = jest.spyOn(walletRepoMock, "findById").mockResolvedValue(wallet);

    const pair = new BlockchainWallet();
    pair.walletId = "w-id";
    const chainWalletSpy = jest.spyOn(chainWalletRepoMock, "findByWalletIdAndBlockchainId").mockResolvedValue(pair);

    const command = new StartSignatureAuthenticationCommand();
    command.blockchainId = "b-id";
    command.address = "the-address";
    command.walletId = "w-id";
    command.userId = "the-user";

    const configSpy = jest.spyOn(configServiceMock, "get").mockReturnValue("message intro");
    const idSpy = jest.spyOn(idGeneratorMock, "generateUUID").mockReturnValue("the-id");
    const saveSpy = jest.spyOn(authenticationRepoMock, "save").mockImplementation((value) => Promise.resolve(value));
    const deleteSpy = jest.spyOn(authenticationRepoMock, "deleteByAddressAndChain").mockResolvedValue(1);

    const nonce = await executor.execute(command);
    expect(nonce.nonce).toBe("message intro the-id");

    expect(configSpy).toHaveBeenCalledTimes(1);
    expect(configSpy).toHaveBeenCalledWith("SIGNATURE_MESSAGE");

    expect(idSpy).toHaveBeenCalledTimes(1);

    const expectedAuthentication = new SignatureAuthentication();
    expectedAuthentication.walletId = "w-id";
    expectedAuthentication.address = "the-address";
    expectedAuthentication.message = "message intro the-id";
    expectedAuthentication.blockchainId = "b-id";
    expectedAuthentication.userId = "the-user";
    delete expectedAuthentication.createdAt;

    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining(expectedAuthentication));

    expect(deleteSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).toHaveBeenCalledWith("the-address", "b-id");
});
