import { IdGenerator } from "../../infrastructure/id-generator";
import { Test } from "@nestjs/testing";
import { SignatureAuthenticationRepository } from "../../security/signature-authentication-repository";
import { ConfigService } from "@nestjs/config";
import { getThrowingFunction } from "../../test-utils/mocking";
import { StartSignatureAuthenticationExecutor } from "./start-signature-authentication-executor";
import { StartSignatureAuthenticationCommand } from "./start-signature-authentication-command";
import { Blockchains, StartSignatureAuthenticationDto, SupportedWallets } from "@nft-marketplace/common";
import { SignatureAuthentication } from "../../security/signature-authentication";

const idGeneratorMock: Partial<IdGenerator> = {
    generateUUID: getThrowingFunction()
};

const repoMock: Partial<SignatureAuthenticationRepository> = {
    save: getThrowingFunction(),
    deleteByAddressAndChain: getThrowingFunction()
};

const configServiceMock: Partial<ConfigService> = {
    get: getThrowingFunction()
};

let executor: StartSignatureAuthenticationExecutor;

beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
        providers: [
            StartSignatureAuthenticationExecutor,
            {
                provide: SignatureAuthenticationRepository,
                useValue: repoMock
            },
            {
                provide: IdGenerator,
                useValue: idGeneratorMock
            },
            {
                provide: ConfigService,
                useValue: configServiceMock
            }
        ]
    }).compile();

    executor = moduleRef.get(StartSignatureAuthenticationExecutor);
});

test("execute - builds and saves authentication after deleting previous", async () => {
    const configSpy = jest.spyOn(configServiceMock, "get").mockReturnValue("message intro");
    const idSpy = jest.spyOn(idGeneratorMock, "generateUUID").mockReturnValue("the-id");
    const saveSpy = jest.spyOn(repoMock, "save").mockImplementation((value) => Promise.resolve(value));
    const deleteSpy = jest.spyOn(repoMock, "deleteByAddressAndChain").mockResolvedValue(true);

    const dto = new StartSignatureAuthenticationDto();
    dto.blockchain = Blockchains.ETHEREUM;
    dto.walletAddress = "the-address";
    dto.wallet = SupportedWallets.METAMASK;
    const command = new StartSignatureAuthenticationCommand(dto);

    const nonce = await executor.execute(command);
    expect(nonce.nonce).toBe("message intro the-id");

    expect(configSpy).toHaveBeenCalledTimes(1);
    expect(configSpy).toHaveBeenCalledWith("SIGNATURE_MESSAGE");

    expect(idSpy).toHaveBeenCalledTimes(1);

    const expectedAuthentication = new SignatureAuthentication();
    expectedAuthentication.wallet = SupportedWallets.METAMASK;
    expectedAuthentication.address = "the-address";
    expectedAuthentication.message = "message intro the-id";
    expectedAuthentication.blockchain = Blockchains.ETHEREUM;

    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).toHaveBeenCalledWith(expectedAuthentication);

    expect(deleteSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).toHaveBeenCalledWith("the-address", Blockchains.ETHEREUM);
});
