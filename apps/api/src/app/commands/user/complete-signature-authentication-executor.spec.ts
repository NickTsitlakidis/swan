import { IdGenerator } from "../../infrastructure/id-generator";
import { Test } from "@nestjs/testing";
import { SignatureAuthenticationRepository } from "../../security/signature-authentication-repository";
import { getThrower } from "../../test-utils/mocking";
import { Blockchains, CompleteSignatureAuthenticationDto, SupportedWallets, TokenDto } from "@nft-marketplace/common";
import { CompleteSignatureAuthenticationExecutor } from "./complete-signature-authentication-executor";
import { SignatureValidator } from "./signature-validator";
import { UserTokenIssuer } from "../../security/user-token-issuer";
import { WalletViewRepository } from "../../views/wallet/wallet-view-repository";
import { CompleteSignatureAuthenticationCommand } from "./complete-signature-authentication-command";
import { UnauthorizedException } from "@nestjs/common";
import { SignatureAuthentication } from "../../security/signature-authentication";
import { ObjectId } from "mongodb";
import { WalletView } from "../../views/wallet/wallet-view";
import * as moment from "moment";
import { UserFactory } from "../../domain/user/user-factory";
import { User } from "../../domain/user/user";
import { Wallet } from "../../domain/user/wallet";

const idGeneratorMock: Partial<IdGenerator> = {
    generateEntityId: getThrower()
};

const validatorMock: Partial<SignatureValidator> = {
    validateEthereumSignature: getThrower(),
    validateSolanaSignature: getThrower()
};

const authenticationRepoMock: Partial<SignatureAuthenticationRepository> = {
    findByAddressAndChain: getThrower(),
    deleteById: getThrower()
};

const issuerMock: Partial<UserTokenIssuer> = {
    issueFromId: getThrower()
};

const walletViewRepoMock: Partial<WalletViewRepository> = {
    findByAddressAndBlockchain: getThrower()
};

const factoryMock: Partial<UserFactory> = {
    createNew: getThrower()
};

let executor: CompleteSignatureAuthenticationExecutor;

beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
        providers: [
            CompleteSignatureAuthenticationExecutor,
            {
                provide: SignatureAuthenticationRepository,
                useValue: authenticationRepoMock
            },
            {
                provide: IdGenerator,
                useValue: idGeneratorMock
            },
            {
                provide: UserFactory,
                useValue: factoryMock
            },
            {
                provide: WalletViewRepository,
                useValue: walletViewRepoMock
            },
            {
                provide: UserTokenIssuer,
                useValue: issuerMock
            },
            {
                provide: SignatureValidator,
                useValue: validatorMock
            }
        ]
    }).compile();

    executor = moduleRef.get(CompleteSignatureAuthenticationExecutor);
});

test("execute - throws if authentication is missing", async () => {
    const dto = new CompleteSignatureAuthenticationDto();
    dto.walletAddress = "addr";
    dto.blockchain = Blockchains.SOLANA;
    dto.signature = "signature";
    const command = new CompleteSignatureAuthenticationCommand(dto);

    const findAuthenticationSpy = jest
        .spyOn(authenticationRepoMock, "findByAddressAndChain")
        .mockResolvedValue(undefined);

    await expect(executor.execute(command)).rejects.toThrow(UnauthorizedException);

    expect(findAuthenticationSpy).toHaveBeenCalledWith("addr", Blockchains.SOLANA);
    expect(findAuthenticationSpy).toHaveBeenCalledTimes(1);
});

test("execute - throws if solana signature is invalid", async () => {
    const dto = new CompleteSignatureAuthenticationDto();
    dto.walletAddress = "addr";
    dto.blockchain = Blockchains.SOLANA;
    dto.signature = "signature";
    const command = new CompleteSignatureAuthenticationCommand(dto);

    const authentication = new SignatureAuthentication();
    authentication.address = "auth-address";
    authentication.message = "auth-message";
    authentication.blockchain = Blockchains.SOLANA;

    const findAuthenticationSpy = jest
        .spyOn(authenticationRepoMock, "findByAddressAndChain")
        .mockResolvedValue(authentication);
    const validatorSpy = jest.spyOn(validatorMock, "validateSolanaSignature").mockReturnValue(false);

    await expect(executor.execute(command)).rejects.toThrow(UnauthorizedException);

    expect(findAuthenticationSpy).toHaveBeenCalledWith("addr", Blockchains.SOLANA);
    expect(findAuthenticationSpy).toHaveBeenCalledTimes(1);

    expect(validatorSpy).toHaveBeenCalledWith("signature", "auth-address", "auth-message");
    expect(validatorSpy).toHaveBeenCalledTimes(1);
});

test("execute - throws if ethereum signature is invalid", async () => {
    const dto = new CompleteSignatureAuthenticationDto();
    dto.walletAddress = "addr";
    dto.blockchain = Blockchains.ETHEREUM;
    dto.signature = "signature";
    const command = new CompleteSignatureAuthenticationCommand(dto);

    const authentication = new SignatureAuthentication();
    authentication.address = "auth-address";
    authentication.message = "auth-message";
    authentication.blockchain = Blockchains.ETHEREUM;

    const findAuthenticationSpy = jest
        .spyOn(authenticationRepoMock, "findByAddressAndChain")
        .mockResolvedValue(authentication);
    const validatorSpy = jest.spyOn(validatorMock, "validateEthereumSignature").mockReturnValue(false);

    await expect(executor.execute(command)).rejects.toThrow(UnauthorizedException);

    expect(findAuthenticationSpy).toHaveBeenCalledWith("addr", Blockchains.ETHEREUM);
    expect(findAuthenticationSpy).toHaveBeenCalledTimes(1);

    expect(validatorSpy).toHaveBeenCalledWith("signature", "auth-address", "auth-message");
    expect(validatorSpy).toHaveBeenCalledTimes(1);
});

test("execute - returns token of existing user", async () => {
    const dto = new CompleteSignatureAuthenticationDto();
    dto.walletAddress = "addr";
    dto.blockchain = Blockchains.SOLANA;
    dto.signature = "signature";
    const command = new CompleteSignatureAuthenticationCommand(dto);

    const authentication = new SignatureAuthentication();
    authentication.address = "auth-address";
    authentication.message = "auth-message";
    authentication.blockchain = Blockchains.SOLANA;
    authentication._id = new ObjectId();

    const findAuthenticationSpy = jest
        .spyOn(authenticationRepoMock, "findByAddressAndChain")
        .mockResolvedValue(authentication);
    const validatorSpy = jest.spyOn(validatorMock, "validateSolanaSignature").mockReturnValue(true);
    const deleteAuthSpy = jest.spyOn(authenticationRepoMock, "deleteById").mockResolvedValue({ result: {} });

    const wallet = new WalletView();
    wallet.userId = "user1";
    const findWalletSpy = jest.spyOn(walletViewRepoMock, "findByAddressAndBlockchain").mockResolvedValue(wallet);

    const token = new TokenDto("t", moment.utc());
    const issuerSpy = jest.spyOn(issuerMock, "issueFromId").mockResolvedValue(token);

    const result = await executor.execute(command);
    expect(result).toBe(token);

    expect(findAuthenticationSpy).toHaveBeenCalledWith("addr", Blockchains.SOLANA);
    expect(findAuthenticationSpy).toHaveBeenCalledTimes(1);

    expect(validatorSpy).toHaveBeenCalledWith("signature", "auth-address", "auth-message");
    expect(validatorSpy).toHaveBeenCalledTimes(1);

    expect(deleteAuthSpy).toHaveBeenCalledTimes(1);
    expect(deleteAuthSpy).toHaveBeenCalledWith(authentication.id);

    expect(findWalletSpy).toHaveBeenCalledTimes(1);
    expect(findWalletSpy).toHaveBeenCalledWith("addr", Blockchains.SOLANA);

    expect(issuerSpy).toHaveBeenCalledTimes(1);
    expect(issuerSpy).toHaveBeenCalledWith("user1");
});

test("execute - returns token of new user", async () => {
    const dto = new CompleteSignatureAuthenticationDto();
    dto.walletAddress = "addr";
    dto.blockchain = Blockchains.SOLANA;
    dto.signature = "signature";
    const command = new CompleteSignatureAuthenticationCommand(dto);

    const authentication = new SignatureAuthentication();
    authentication.address = "auth-address";
    authentication.message = "auth-message";
    authentication.blockchain = Blockchains.SOLANA;
    authentication.wallet = SupportedWallets.LEDGER;
    authentication._id = new ObjectId();

    const findAuthenticationSpy = jest
        .spyOn(authenticationRepoMock, "findByAddressAndChain")
        .mockResolvedValue(authentication);
    const validatorSpy = jest.spyOn(validatorMock, "validateSolanaSignature").mockReturnValue(true);
    const deleteAuthSpy = jest.spyOn(authenticationRepoMock, "deleteById").mockResolvedValue({ result: {} });

    const findWalletSpy = jest.spyOn(walletViewRepoMock, "findByAddressAndBlockchain").mockResolvedValue(undefined);

    const token = new TokenDto("t", moment.utc());
    const issuerSpy = jest.spyOn(issuerMock, "issueFromId").mockResolvedValue(token);

    const idSpy = jest.spyOn(idGeneratorMock, "generateEntityId").mockReturnValue("mongo-id");

    const userMock = User.create("some-id", new Wallet("", "", Blockchains.ETHEREUM, SupportedWallets.LEDGER));
    const commitSpy = jest.spyOn(userMock, "commit").mockResolvedValue(userMock);
    const factorySpy = jest.spyOn(factoryMock, "createNew").mockReturnValue(userMock);

    const result = await executor.execute(command);
    expect(result).toBe(token);

    expect(findAuthenticationSpy).toHaveBeenCalledWith("addr", Blockchains.SOLANA);
    expect(findAuthenticationSpy).toHaveBeenCalledTimes(1);

    expect(validatorSpy).toHaveBeenCalledWith("signature", "auth-address", "auth-message");
    expect(validatorSpy).toHaveBeenCalledTimes(1);

    expect(deleteAuthSpy).toHaveBeenCalledTimes(1);
    expect(deleteAuthSpy).toHaveBeenCalledWith(authentication.id);

    expect(findWalletSpy).toHaveBeenCalledTimes(1);
    expect(findWalletSpy).toHaveBeenCalledWith("addr", Blockchains.SOLANA);

    expect(issuerSpy).toHaveBeenCalledTimes(1);
    expect(issuerSpy).toHaveBeenCalledWith("some-id");

    expect(idSpy).toHaveBeenCalledTimes(1);

    expect(commitSpy).toHaveBeenCalledTimes(1);

    const expectedNewWallet = new Wallet("mongo-id", "auth-address", Blockchains.SOLANA, SupportedWallets.LEDGER);

    expect(factorySpy).toHaveBeenCalledTimes(1);
    expect(factorySpy).toHaveBeenCalledWith(expectedNewWallet);
});
