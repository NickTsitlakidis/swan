import { IdGenerator } from "../infrastructure/id-generator";
import { JwtService, JwtSignOptions } from "@nestjs/jwt";
import { RefreshTokenRepository } from "./refresh-token-repository";
import { UserTokenIssuer } from "./user-token-issuer";
import { UnauthorizedException } from "@nestjs/common";
import { RefreshToken } from "./refresh-token";
import { getUnitTestingModule } from "../test-utils/test-modules";
import { DateTime } from "luxon";
import { ConfigService } from "@nestjs/config";

let idGeneratorMock: IdGenerator;
let jwtServiceMock: JwtService;
let repoMock: RefreshTokenRepository;
let issuer: UserTokenIssuer;
let configService: ConfigService;

beforeEach(async () => {
    const moduleRef = await getUnitTestingModule(UserTokenIssuer);

    issuer = moduleRef.get(UserTokenIssuer);
    repoMock = moduleRef.get(RefreshTokenRepository);
    jwtServiceMock = moduleRef.get(JwtService);
    idGeneratorMock = moduleRef.get(IdGenerator);
    configService = moduleRef.get(ConfigService);
});

test("issueFromId - creates and stores token", async () => {
    const generateEntityIdSpy = jest
        .spyOn(idGeneratorMock, "generateEntityId")
        .mockReturnValue("507f1f77bcf86cd799439011");
    const generateDisplayIdSpy = jest.spyOn(idGeneratorMock, "generateUUID").mockReturnValue("uuid");

    const saved = new RefreshToken();
    saved.tokenValue = "uuid";
    const saveSpy = jest.spyOn(repoMock, "save").mockResolvedValue(saved);

    const signSpy = jest.spyOn(jwtServiceMock, "sign").mockReturnValue("signed");

    const configSpy = jest.spyOn(configService, "getOrThrow").mockReturnValue(50);

    const result = await issuer.issueFromId("the-user");

    expect(result.tokenValue).toBe("signed");
    expect(result.refreshToken).toBe("signed");
    expect(result.expiresAt > DateTime.now().toUTC()).toBe(true);

    expect(generateDisplayIdSpy).toHaveBeenCalledTimes(1);
    expect(generateEntityIdSpy).toHaveBeenCalledTimes(1);

    const expectedRefreshToken: Partial<RefreshToken> = new RefreshToken();
    expectedRefreshToken.userId = "the-user";
    expectedRefreshToken.tokenValue = "uuid";
    expectedRefreshToken.isRevoked = false;
    expectedRefreshToken.id = "507f1f77bcf86cd799439011";
    delete expectedRefreshToken.issuedAt;
    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining(expectedRefreshToken));
    expect(configSpy).toHaveBeenCalledTimes(1);
    expect(configSpy).toHaveBeenCalledWith("USER_ACCESS_TOKEN_EXPIRATION_MINUTES");

    const expectedRefreshOptions: JwtSignOptions = {
        subject: "the-user",
        jwtid: "uuid",
        algorithm: "ES256"
    };

    const expectedAccessOptions: JwtSignOptions = {
        subject: "the-user",
        expiresIn: "50m",
        algorithm: "ES256"
    };

    expect(signSpy).toHaveBeenCalledTimes(2);
    expect(signSpy).toHaveBeenNthCalledWith(1, {}, expect.objectContaining(expectedRefreshOptions));
    expect(signSpy).toHaveBeenNthCalledWith(2, {}, expect.objectContaining(expectedAccessOptions));
});

test("issueFromRefreshToken - throws for non existing token", async () => {
    const findSpy = jest.spyOn(repoMock, "findByTokenValue").mockResolvedValue(null);

    const verified = {
        jti: "the-token"
    };
    const verifySpy = jest.spyOn(jwtServiceMock, "verify").mockReturnValue(verified);

    await expect(issuer.issueFromRefreshToken("encoded-jwt")).rejects.toThrow(UnauthorizedException);

    expect(verifySpy).toHaveBeenCalledTimes(1);
    expect(verifySpy).toHaveBeenCalledWith("encoded-jwt");
    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(findSpy).toHaveBeenCalledWith("the-token");
});

test("issueFromRefreshToken - throws for invalid jwt", async () => {
    const verifySpy = jest.spyOn(jwtServiceMock, "verify").mockImplementation(() => {
        throw "error";
    });

    await expect(issuer.issueFromRefreshToken("encoded-jwt")).rejects.toThrow(UnauthorizedException);

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

    await expect(issuer.issueFromRefreshToken("encoded-jwt")).rejects.toThrow(UnauthorizedException);

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
    const configSpy = jest.spyOn(configService, "getOrThrow").mockReturnValue(50);

    const verified = {
        jti: "the-token"
    };
    const verifySpy = jest.spyOn(jwtServiceMock, "verify").mockReturnValue(verified);

    const created = await issuer.issueFromRefreshToken("encoded-jwt");

    expect(created.tokenValue).toBe("signed");
    expect(created.refreshToken).toBe("encoded-jwt");
    expect(created.expiresAt > DateTime.now().toUTC()).toBe(true);

    expect(verifySpy).toHaveBeenCalledTimes(1);
    expect(verifySpy).toHaveBeenCalledWith("encoded-jwt");
    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(findSpy).toHaveBeenCalledWith("the-token");
    expect(configSpy).toHaveBeenCalledTimes(1);
    expect(configSpy).toHaveBeenCalledWith("USER_ACCESS_TOKEN_EXPIRATION_MINUTES");

    const expectedAccessOptions: JwtSignOptions = {
        subject: "the-user",
        expiresIn: "50m",
        algorithm: "ES256"
    };

    expect(signSpy).toHaveBeenCalledTimes(1);
    expect(signSpy).toHaveBeenNthCalledWith(1, {}, expect.objectContaining(expectedAccessOptions));
});
