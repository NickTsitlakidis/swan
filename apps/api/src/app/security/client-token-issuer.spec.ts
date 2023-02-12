import { JwtService, JwtSignOptions } from "@nestjs/jwt";
import { ClientTokenIssuer } from "./client-token-issuer";
import { getUnitTestingModule } from "../test-utils/test-modules";
import { ClientRepository } from "./client-repository";
import { UnauthorizedException } from "@nestjs/common";
import { Client } from "./client";
import { hashSync } from "bcrypt";
import { ConfigService } from "@nestjs/config";

let issuer: ClientTokenIssuer;
let repository: ClientRepository;
let jwtService: JwtService;
let configService: ConfigService;

beforeEach(async () => {
    const moduleRef = await getUnitTestingModule(ClientTokenIssuer);

    issuer = moduleRef.get(ClientTokenIssuer);
    repository = moduleRef.get(ClientRepository);
    jwtService = moduleRef.get(JwtService);
    configService = moduleRef.get(ConfigService);
});

test("issueWithCredentials - throws for non base64 value", async () => {
    await expect(issuer.issueWithCredentials("app:secret")).rejects.toThrow(UnauthorizedException);
});

test("issueWithCredentials - throws for value with no :", async () => {
    const encoded = Buffer.from("appandsecret").toString("base64");
    await expect(issuer.issueWithCredentials(encoded)).rejects.toThrow(UnauthorizedException);
});

test("issueWithCredentials - throws if client doesnt exist", async () => {
    const findSpy = jest.spyOn(repository, "findByApplicationId").mockResolvedValue(null);

    const encoded = Buffer.from("app:secret").toString("base64");
    await expect(issuer.issueWithCredentials(encoded)).rejects.toThrow(UnauthorizedException);

    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(findSpy).toHaveBeenCalledWith("app");
});

test("issueWithCredentials - throws if client secret doesnt match", async () => {
    const client = new Client();
    client.applicationSecret = hashSync("other-secret", 12);
    const findSpy = jest.spyOn(repository, "findByApplicationId").mockResolvedValue(client);

    const encoded = Buffer.from("app:secret").toString("base64");
    await expect(issuer.issueWithCredentials(encoded)).rejects.toThrow(UnauthorizedException);

    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(findSpy).toHaveBeenCalledWith("app");
});

test("issueWithCredentials - issues jwt if credentials match", async () => {
    const client = new Client();
    client.applicationId = "app";
    client.applicationSecret = hashSync("secret", 12);
    const findSpy = jest.spyOn(repository, "findByApplicationId").mockResolvedValue(client);
    const configSpy = jest.spyOn(configService, "getOrThrow").mockReturnValue(88);
    const signSpy = jest.spyOn(jwtService, "sign").mockReturnValue("jwt-token");

    const encoded = Buffer.from(`app:secret`).toString("base64");
    const token = await issuer.issueWithCredentials(encoded);

    expect(token.tokenValue).toBe("jwt-token");
    expect(token.expiresAt).toBeDefined();
    expect(configSpy).toHaveBeenCalledWith("CLIENT_TOKEN_EXPIRATION_MINUTES");
    expect(configSpy).toHaveBeenCalledTimes(1);

    const expectedJwtSettings: JwtSignOptions = {
        subject: "app",
        algorithm: "ES256",
        expiresIn: "88m"
    };

    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(findSpy).toHaveBeenCalledWith("app");

    expect(signSpy).toHaveBeenCalledTimes(1);
    expect(signSpy).toHaveBeenCalledWith({}, expectedJwtSettings);
});
