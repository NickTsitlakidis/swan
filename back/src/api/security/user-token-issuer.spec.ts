import { IdGenerator } from "../../infrastructure/id-generator";
import { JwtService, JwtSignOptions } from "@nestjs/jwt";
import { RefreshTokenRepository } from "./refresh-token-repository";
import { UserTokenIssuer } from "./user-token-issuer";
import { Test } from "@nestjs/testing";
import { UnauthorizedException } from "@nestjs/common";
import { RefreshToken } from "./refresh-token";
import { getMockCalledParameters } from "../../test-utils/mocking";
import * as moment from "moment";

const idGeneratorMock: Partial<IdGenerator> = {
    generateUUID: () => {
        throw "should never be called";
    },
    generateEntityId: () => {
        throw "should never be called";
    }
};

const jwtServiceMock: Partial<JwtService> = {
    sign: () => "",
    verify: () => undefined
};

const repoMock: Partial<RefreshTokenRepository> = {
    save: () => Promise.resolve(undefined),
    findByTokenValue: () => undefined
};

let issuer: UserTokenIssuer;

beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
        providers: [
            UserTokenIssuer,
            {
                provide: JwtService,
                useValue: jwtServiceMock
            },
            {
                provide: IdGenerator,
                useValue: idGeneratorMock
            },
            {
                provide: RefreshTokenRepository,
                useValue: repoMock
            }
        ]
    }).compile();

    issuer = moduleRef.get(UserTokenIssuer);
});

test("issueFromId - creates and stores token", async () => {
    const generateEntityIdSpy = jest
        .spyOn(idGeneratorMock, "generateEntityId")
        .mockReturnValue("507f1f77bcf86cd799439011");
    const generateDisplayIdSpy = jest
        .spyOn(idGeneratorMock, "generateUUID")
        .mockReturnValue("uuid");

    const saved = new RefreshToken();
    saved.tokenValue = "uuid";
    const saveSpy = jest.spyOn(repoMock, "save").mockResolvedValue(saved);

    const signSpy = jest.spyOn(jwtServiceMock, "sign").mockReturnValue("signed");

    const result = await issuer.issueFromId("the-user");

    expect(result.tokenValue).toBe("signed");
    expect(result.refreshToken).toBe("signed");
    expect(result.expiresAt.isAfter(moment.utc()));

    expect(generateDisplayIdSpy).toHaveBeenCalledTimes(1);
    expect(generateEntityIdSpy).toHaveBeenCalledTimes(1);

    const savedRefreshToken: RefreshToken = getMockCalledParameters(saveSpy)[0];

    expect(savedRefreshToken.tokenValue).toBe("uuid");
    expect(savedRefreshToken.isRevoked).toBe(false);
    expect(savedRefreshToken.userId).toBe("the-user");
    expect(savedRefreshToken.id).toBe("507f1f77bcf86cd799439011");
    expect(saveSpy).toHaveBeenCalledTimes(1);

    const refreshSignOptions: JwtSignOptions = getMockCalledParameters(signSpy, 2)[1];
    const accessSignOptions: JwtSignOptions = getMockCalledParameters(signSpy, 2, 2)[1];

    expect(refreshSignOptions.subject).toBe("the-user");
    expect(refreshSignOptions.jwtid).toBe("uuid");

    expect(accessSignOptions.subject).toBe("the-user");
    expect(accessSignOptions.expiresIn).toBe("120m");
});

test("issueFromRefreshToken - throws for non existing token", async () => {
    const findSpy = jest.spyOn(repoMock, "findByTokenValue").mockResolvedValue(undefined);

    const verified = {
        jti: "the-token"
    };
    const verifySpy = jest.spyOn(jwtServiceMock, "verify").mockReturnValue(verified);

    await expect(issuer.issueFromRefreshToken("encoded-jwt")).rejects.toThrow(
        UnauthorizedException
    );

    expect(verifySpy).toHaveBeenCalledTimes(1);
    expect(verifySpy).toHaveBeenCalledWith("encoded-jwt");
    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(findSpy).toHaveBeenCalledWith("the-token");
});

test("issueFromRefreshToken - throws for invalid jwt", async () => {
    const verifySpy = jest.spyOn(jwtServiceMock, "verify").mockImplementation(() => {
        throw "error";
    });

    await expect(issuer.issueFromRefreshToken("encoded-jwt")).rejects.toThrow(
        UnauthorizedException
    );

    expect(verifySpy).toHaveBeenCalledTimes(1);
    expect(verifySpy).toHaveBeenCalledWith("encoded-jwt");
});

test("issueFromRefreshToken - throws for revoked refresh token", async () => {
    const found = new RefreshToken();
    found.id = "507f1f77bcf86cd799439011";
    found.isRevoked = true;
    const findSpy = jest.spyOn(repoMock, "findByTokenValue").mockResolvedValue(found);

    const verified = {
        jti: "the-token"
    };
    const verifySpy = jest.spyOn(jwtServiceMock, "verify").mockReturnValue(verified);

    await expect(issuer.issueFromRefreshToken("encoded-jwt")).rejects.toThrow(
        UnauthorizedException
    );

    expect(verifySpy).toHaveBeenCalledTimes(1);
    expect(verifySpy).toHaveBeenCalledWith("encoded-jwt");
    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(findSpy).toHaveBeenCalledWith("the-token");
});

test("issueFromRefreshToken - creates and returns for valid refresh token", async () => {
    const found = new RefreshToken();
    found.id = "507f1f77bcf86cd799439011";
    found.isRevoked = false;
    found.userId = "the-user";

    const findSpy = jest.spyOn(repoMock, "findByTokenValue").mockResolvedValue(found);
    const signSpy = jest.spyOn(jwtServiceMock, "sign").mockReturnValue("signed");

    const verified = {
        jti: "the-token"
    };
    const verifySpy = jest.spyOn(jwtServiceMock, "verify").mockReturnValue(verified);

    const created = await issuer.issueFromRefreshToken("encoded-jwt");

    expect(created.tokenValue).toBe("signed");
    expect(created.refreshToken).toBe("encoded-jwt");
    expect(created.expiresAt.isAfter(moment.utc()));

    expect(verifySpy).toHaveBeenCalledTimes(1);
    expect(verifySpy).toHaveBeenCalledWith("encoded-jwt");
    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(findSpy).toHaveBeenCalledWith("the-token");

    const accessSignOptions: JwtSignOptions = getMockCalledParameters(signSpy, 2, 1)[1];

    expect(accessSignOptions.subject).toBe("the-user");
    expect(accessSignOptions.expiresIn).toBe("120m");
});
