import { IdGenerator } from "../../infrastructure/id-generator";
import { SignatureAuthenticationRepository } from "../../security/signature-authentication-repository";
import { TokenDto } from "@swan/dto";
import { CompleteSignatureAuthenticationExecutor } from "./complete-signature-authentication-executor";
import { SignatureValidator } from "./signature-validator";
import { UserTokenIssuer } from "../../security/user-token-issuer";
import { UserWalletViewRepository } from "../../views/user-wallet/user-wallet-view-repository";
import { CompleteSignatureAuthenticationCommand } from "./complete-signature-authentication-command";
import { UnauthorizedException } from "@nestjs/common";
import { SignatureAuthentication } from "../../security/signature-authentication";
import { ObjectId } from "mongodb";
import { UserWalletView } from "../../views/user-wallet/user-wallet-view";
import * as moment from "moment";
import { UserFactory } from "../../domain/user/user-factory";
import { User } from "../../domain/user/user";
import { BlockchainRepository } from "../../support/blockchains/blockchain-repository";
import { Blockchain } from "../../support/blockchains/blockchain";
import { SignatureTypes } from "../../support/blockchains/signature-types";
import { UserWallet } from "../../domain/user/user-wallet";
import { getUnitTestingModule } from "../../test-utils/test-modules";

let validatorMock: SignatureValidator;
let authenticationRepoMock: SignatureAuthenticationRepository;
let issuerMock: UserTokenIssuer;
let walletViewRepoMock: UserWalletViewRepository;
let factoryMock: UserFactory;
let idGeneratorMock: IdGenerator;
let blockchainRepoMock: BlockchainRepository;

let executor: CompleteSignatureAuthenticationExecutor;

beforeEach(async () => {
    const moduleRef = await getUnitTestingModule(CompleteSignatureAuthenticationExecutor);

    validatorMock = moduleRef.get(SignatureValidator);
    authenticationRepoMock = moduleRef.get(SignatureAuthenticationRepository);
    issuerMock = moduleRef.get(UserTokenIssuer);
    walletViewRepoMock = moduleRef.get(UserWalletViewRepository);
    factoryMock = moduleRef.get(UserFactory);
    idGeneratorMock = moduleRef.get(IdGenerator);
    blockchainRepoMock = moduleRef.get(BlockchainRepository);
    executor = moduleRef.get(CompleteSignatureAuthenticationExecutor);
});

test("execute - throws if authentication is missing", async () => {
    const command = new CompleteSignatureAuthenticationCommand();
    command.signature = "signature";
    command.blockchainId = "block";
    command.address = "addr";

    const findAuthenticationSpy = jest
        .spyOn(authenticationRepoMock, "findByAddressAndChain")
        .mockResolvedValue(undefined);

    await expect(executor.execute(command)).rejects.toThrow(UnauthorizedException);

    expect(findAuthenticationSpy).toHaveBeenCalledWith("addr", "block");
    expect(findAuthenticationSpy).toHaveBeenCalledTimes(1);
});

test("execute - throws if solana signature is invalid", async () => {
    const command = new CompleteSignatureAuthenticationCommand();
    command.signature = "signature";
    command.blockchainId = "block";
    command.address = "addr";

    const authentication = new SignatureAuthentication();
    authentication.address = "auth-address";
    authentication.message = "auth-message";
    authentication.blockchainId = "block";
    authentication._id = new ObjectId();

    const deleteAuthSpy = jest.spyOn(authenticationRepoMock, "deleteById").mockResolvedValue(1);

    const findAuthenticationSpy = jest
        .spyOn(authenticationRepoMock, "findByAddressAndChain")
        .mockResolvedValue(authentication);

    const blockchain = new Blockchain();
    blockchain.signatureType = SignatureTypes.SOLANA;

    const blockchainSpy = jest.spyOn(blockchainRepoMock, "findById").mockResolvedValue(blockchain);

    const validatorSpy = jest.spyOn(validatorMock, "validateSolanaSignature").mockReturnValue(false);

    await expect(executor.execute(command)).rejects.toThrow(UnauthorizedException);

    expect(findAuthenticationSpy).toHaveBeenCalledWith("addr", "block");
    expect(findAuthenticationSpy).toHaveBeenCalledTimes(1);

    expect(validatorSpy).toHaveBeenCalledWith("signature", "auth-address", "auth-message");
    expect(validatorSpy).toHaveBeenCalledTimes(1);

    expect(blockchainSpy).toHaveBeenCalledTimes(1);
    expect(blockchainSpy).toHaveBeenCalledWith("block");

    expect(deleteAuthSpy).toHaveBeenCalledTimes(1);
    expect(deleteAuthSpy).toHaveBeenCalledWith(authentication.id);
});

test("execute - throws if ethereum signature is invalid", async () => {
    const command = new CompleteSignatureAuthenticationCommand();
    command.signature = "signature";
    command.blockchainId = "block";
    command.address = "addr";

    const authentication = new SignatureAuthentication();
    authentication.address = "auth-address";
    authentication.message = "auth-message";
    authentication.blockchainId = "block";
    authentication._id = new ObjectId();

    const deleteAuthSpy = jest.spyOn(authenticationRepoMock, "deleteById").mockResolvedValue(1);

    const findAuthenticationSpy = jest
        .spyOn(authenticationRepoMock, "findByAddressAndChain")
        .mockResolvedValue(authentication);

    const blockchain = new Blockchain();
    blockchain.signatureType = SignatureTypes.EVM;

    const blockchainSpy = jest.spyOn(blockchainRepoMock, "findById").mockResolvedValue(blockchain);

    const validatorSpy = jest.spyOn(validatorMock, "validateEvmSignature").mockReturnValue(false);

    await expect(executor.execute(command)).rejects.toThrow(UnauthorizedException);

    expect(findAuthenticationSpy).toHaveBeenCalledWith("addr", "block");
    expect(findAuthenticationSpy).toHaveBeenCalledTimes(1);

    expect(validatorSpy).toHaveBeenCalledWith("signature", "auth-address", "auth-message");
    expect(validatorSpy).toHaveBeenCalledTimes(1);

    expect(blockchainSpy).toHaveBeenCalledTimes(1);
    expect(blockchainSpy).toHaveBeenCalledWith("block");

    expect(deleteAuthSpy).toHaveBeenCalledTimes(1);
    expect(deleteAuthSpy).toHaveBeenCalledWith(authentication.id);
});

test("execute - returns token of existing user", async () => {
    const command = new CompleteSignatureAuthenticationCommand();
    command.signature = "signature";
    command.blockchainId = "block";
    command.address = "addr";

    const blockchain = new Blockchain();
    blockchain.signatureType = SignatureTypes.SOLANA;

    const blockchainSpy = jest.spyOn(blockchainRepoMock, "findById").mockResolvedValue(blockchain);

    const authentication = new SignatureAuthentication();
    authentication.address = "auth-address";
    authentication.message = "auth-message";
    authentication.blockchainId = "block";
    authentication._id = new ObjectId();

    const findAuthenticationSpy = jest
        .spyOn(authenticationRepoMock, "findByAddressAndChain")
        .mockResolvedValue(authentication);
    const validatorSpy = jest.spyOn(validatorMock, "validateSolanaSignature").mockReturnValue(true);
    const deleteAuthSpy = jest.spyOn(authenticationRepoMock, "deleteById").mockResolvedValue(1);

    const wallet = new UserWalletView();
    wallet.userId = "user1";
    const findWalletSpy = jest.spyOn(walletViewRepoMock, "findByAddressAndBlockchain").mockResolvedValue(wallet);

    const token = new TokenDto("t", moment.utc());
    const issuerSpy = jest.spyOn(issuerMock, "issueFromId").mockResolvedValue(token);

    const result = await executor.execute(command);
    expect(result).toBe(token);

    expect(findAuthenticationSpy).toHaveBeenCalledWith("addr", "block");
    expect(findAuthenticationSpy).toHaveBeenCalledTimes(1);

    expect(validatorSpy).toHaveBeenCalledWith("signature", "auth-address", "auth-message");
    expect(validatorSpy).toHaveBeenCalledTimes(1);

    expect(deleteAuthSpy).toHaveBeenCalledTimes(1);
    expect(deleteAuthSpy).toHaveBeenCalledWith(authentication.id);

    expect(findWalletSpy).toHaveBeenCalledTimes(1);
    expect(findWalletSpy).toHaveBeenCalledWith("addr", "block");

    expect(issuerSpy).toHaveBeenCalledTimes(1);
    expect(issuerSpy).toHaveBeenCalledWith("user1");

    expect(blockchainSpy).toHaveBeenCalledTimes(1);
    expect(blockchainSpy).toHaveBeenCalledWith("block");
});

test("execute - returns token of new user", async () => {
    const command = new CompleteSignatureAuthenticationCommand();
    command.signature = "signature";
    command.blockchainId = "block";
    command.address = "addr";

    const blockchain = new Blockchain();
    blockchain.signatureType = SignatureTypes.SOLANA;

    const blockchainSpy = jest.spyOn(blockchainRepoMock, "findById").mockResolvedValue(blockchain);

    const authentication = new SignatureAuthentication();
    authentication.address = "auth-address";
    authentication.message = "auth-message";
    authentication.blockchainId = "block";
    authentication.walletId = "wallet";
    authentication._id = new ObjectId();

    const findAuthenticationSpy = jest
        .spyOn(authenticationRepoMock, "findByAddressAndChain")
        .mockResolvedValue(authentication);
    const validatorSpy = jest.spyOn(validatorMock, "validateSolanaSignature").mockReturnValue(true);
    const deleteAuthSpy = jest.spyOn(authenticationRepoMock, "deleteById").mockResolvedValue(1);

    const findWalletSpy = jest.spyOn(walletViewRepoMock, "findByAddressAndBlockchain").mockResolvedValue(undefined);

    const token = new TokenDto("t", moment.utc());
    const issuerSpy = jest.spyOn(issuerMock, "issueFromId").mockResolvedValue(token);

    const idSpy = jest.spyOn(idGeneratorMock, "generateEntityId").mockReturnValue("mongo-id");

    const userMock = User.create("some-id", new UserWallet("", "", "block", "wallet"));
    const commitSpy = jest.spyOn(userMock, "commit").mockResolvedValue(userMock);
    const factorySpy = jest.spyOn(factoryMock, "createNew").mockReturnValue(userMock);

    const result = await executor.execute(command);
    expect(result).toBe(token);

    expect(findAuthenticationSpy).toHaveBeenCalledWith("addr", "block");
    expect(findAuthenticationSpy).toHaveBeenCalledTimes(1);

    expect(validatorSpy).toHaveBeenCalledWith("signature", "auth-address", "auth-message");
    expect(validatorSpy).toHaveBeenCalledTimes(1);

    expect(deleteAuthSpy).toHaveBeenCalledTimes(1);
    expect(deleteAuthSpy).toHaveBeenCalledWith(authentication.id);

    expect(findWalletSpy).toHaveBeenCalledTimes(1);
    expect(findWalletSpy).toHaveBeenCalledWith("addr", "block");

    expect(issuerSpy).toHaveBeenCalledTimes(1);
    expect(issuerSpy).toHaveBeenCalledWith("some-id");

    expect(idSpy).toHaveBeenCalledTimes(1);

    expect(commitSpy).toHaveBeenCalledTimes(1);

    const expectedNewWallet = new UserWallet("mongo-id", "auth-address", "block", "wallet");

    expect(factorySpy).toHaveBeenCalledTimes(1);
    expect(factorySpy).toHaveBeenCalledWith(expectedNewWallet);

    expect(blockchainSpy).toHaveBeenCalledTimes(1);
    expect(blockchainSpy).toHaveBeenCalledWith("block");
});
