import { ClientGuard } from "./client-guard";
import { JwtModule, JwtService, JwtSignOptions } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { ClientRepository } from "./client-repository";
import { UnauthorizedException } from "@nestjs/common";
import { Client } from "./client";

let guard: ClientGuard;
let jwtService: JwtService;
const clientRepo: Partial<ClientRepository> = {
    findByApplicationId: () => Promise.reject("should never be called")
};
beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
        imports: [
            JwtModule.register({
                secret: "this-is-secret"
            })
        ],
        providers: [{ provide: ClientRepository, useValue: clientRepo }, ClientGuard]
    }).compile();

    guard = moduleRef.get(ClientGuard);
    jwtService = moduleRef.get(JwtService);
});

test("canActivate - throws for missing http request", async () => {
    const context: any = {
        switchToHttp: () => undefined
    };
    const httpHost = {
        getRequest: () => undefined
    };

    const contextSpy = jest.spyOn(context, "switchToHttp").mockReturnValue(httpHost);

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);

    expect(contextSpy).toHaveBeenCalledTimes(1);
});

test("canActivate - throws for missing http headers", async () => {
    const context: any = {
        switchToHttp: () => undefined
    };
    const httpHost = {
        getRequest: () => undefined
    };

    const contextSpy = jest.spyOn(context, "switchToHttp").mockReturnValue(httpHost);
    const getRequestSpy = jest.spyOn(httpHost, "getRequest").mockReturnValue({});

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);

    expect(contextSpy).toHaveBeenCalledTimes(1);
    expect(getRequestSpy).toHaveBeenCalledTimes(1);
});

test("canActivate - throws for missing authorization header", async () => {
    const context: any = {
        switchToHttp: () => undefined
    };
    const httpHost = {
        getRequest: () => undefined
    };
    const contextSpy = jest.spyOn(context, "switchToHttp").mockReturnValue(httpHost);
    const getRequestSpy = jest.spyOn(httpHost, "getRequest").mockReturnValue({ headers: {} });

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);

    expect(contextSpy).toHaveBeenCalledTimes(1);
    expect(getRequestSpy).toHaveBeenCalledTimes(1);
});

test("canActivate - throws for non-bearer header", async () => {
    const context: any = {
        switchToHttp: () => undefined
    };
    const httpHost = {
        getRequest: () => undefined
    };
    const contextSpy = jest.spyOn(context, "switchToHttp").mockReturnValue(httpHost);
    const getRequestSpy = jest
        .spyOn(httpHost, "getRequest")
        .mockReturnValue({ headers: { authorization: "other" } });

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);

    expect(contextSpy).toHaveBeenCalledTimes(1);
    expect(getRequestSpy).toHaveBeenCalledTimes(1);
});

test("canActivate - throws for unverified token", async () => {
    const accessSignOptions: JwtSignOptions = {
        subject: "app-id",
        algorithm: "HS256",
        expiresIn: "120m",
        secret: "other-secret"
    };

    const token = jwtService.sign({ tokenType: "client" }, accessSignOptions);

    const context: any = {
        switchToHttp: () => undefined
    };
    const httpHost = {
        getRequest: () => undefined
    };
    const contextSpy = jest.spyOn(context, "switchToHttp").mockReturnValue(httpHost);
    const getRequestSpy = jest
        .spyOn(httpHost, "getRequest")
        .mockReturnValue({ headers: { authorization: `Bearer ${token}` } });

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);

    expect(contextSpy).toHaveBeenCalledTimes(1);
    expect(getRequestSpy).toHaveBeenCalledTimes(1);
});

test("canActivate - throws for expired token", async () => {
    const accessSignOptions: JwtSignOptions = {
        subject: "app-id",
        algorithm: "HS256",
        expiresIn: "1"
    };

    const token = jwtService.sign({ tokenType: "client" }, accessSignOptions);

    const context: any = {
        switchToHttp: () => undefined
    };
    const httpHost = {
        getRequest: () => undefined
    };
    const contextSpy = jest.spyOn(context, "switchToHttp").mockReturnValue(httpHost);
    const getRequestSpy = jest
        .spyOn(httpHost, "getRequest")
        .mockReturnValue({ headers: { authorization: `Bearer ${token}` } });

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);

    expect(contextSpy).toHaveBeenCalledTimes(1);
    expect(getRequestSpy).toHaveBeenCalledTimes(1);
});

test("canActivate - throws for not matching client", async () => {
    const accessSignOptions: JwtSignOptions = {
        subject: "app-id",
        algorithm: "HS256",
        expiresIn: "120m"
    };

    const token = jwtService.sign({}, accessSignOptions);

    const context: any = {
        switchToHttp: () => undefined
    };
    const httpHost = {
        getRequest: () => undefined
    };
    const contextSpy = jest.spyOn(context, "switchToHttp").mockReturnValue(httpHost);
    const getRequestSpy = jest
        .spyOn(httpHost, "getRequest")
        .mockReturnValue({ headers: { authorization: `Bearer ${token}` } });

    const repositorySpy = jest
        .spyOn(clientRepo, "findByApplicationId")
        .mockResolvedValue(undefined);

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);

    expect(contextSpy).toHaveBeenCalledTimes(1);
    expect(getRequestSpy).toHaveBeenCalledTimes(1);
    expect(repositorySpy).toHaveBeenCalledTimes(1);
    expect(repositorySpy).toHaveBeenCalledWith("app-id");
});

test("canActivate - returns true for all passing rules", async () => {
    const accessSignOptions: JwtSignOptions = {
        subject: "app-id",
        algorithm: "HS256",
        expiresIn: "120m"
    };

    const token = jwtService.sign({}, accessSignOptions);

    const context: any = {
        switchToHttp: () => undefined
    };
    const httpHost = {
        getRequest: () => undefined
    };
    const contextSpy = jest.spyOn(context, "switchToHttp").mockReturnValue(httpHost);
    const getRequestSpy = jest
        .spyOn(httpHost, "getRequest")
        .mockReturnValue({ headers: { authorization: `Bearer ${token}` } });

    const client = new Client();
    client.applicationId = "app-id";

    const repositorySpy = jest.spyOn(clientRepo, "findByApplicationId").mockResolvedValue(client);

    const canActivate = await guard.canActivate(context);
    expect(canActivate).toBe(true);

    expect(contextSpy).toHaveBeenCalledTimes(1);
    expect(getRequestSpy).toHaveBeenCalledTimes(1);
    expect(repositorySpy).toHaveBeenCalledTimes(1);
    expect(repositorySpy).toHaveBeenCalledWith("app-id");
});
