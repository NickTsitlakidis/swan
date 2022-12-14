import { JwtModule, JwtService, JwtSignOptions } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { UserGuard } from "./user-guard";
import { UserViewRepository } from "../../views/user/user-view-repository";
import { UnauthorizedException } from "@nestjs/common";
import { UserView } from "../../views/user/user-view";
import { ObjectId } from "mongodb";

let guard: UserGuard;
let jwtService: JwtService;
const clientRepo: Partial<UserViewRepository> = {
    findById: () => Promise.reject("should never be called")
};
beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
        imports: [
            JwtModule.register({
                secret: "this-is-secret"
            })
        ],
        providers: [{ provide: UserViewRepository, useValue: clientRepo }, UserGuard]
    }).compile();

    guard = moduleRef.get(UserGuard);
    jwtService = moduleRef.get(JwtService);
});

test("UserGuard canActivate - throws for missing token", async () => {
    const context: any = {
        switchToHttp: () => {
            return {
                getRequest: () => {
                    return { headers: { authorization: "other" } };
                }
            };
        }
    };

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
});

test("UserGuard canActivate - throws for expired token", async () => {
    const accessSignOptions: JwtSignOptions = {
        subject: "userId",
        algorithm: "HS256",
        expiresIn: "1"
    };

    const token = jwtService.sign({ tokenType: "client" }, accessSignOptions);

    const context: any = {
        switchToHttp: () => {
            return {
                getRequest: () => {
                    return { headers: { authorization: `Bearer ${token}` } };
                }
            };
        }
    };

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
});

test("UserGuard canActivate - throws for not existing user", async () => {
    const accessSignOptions: JwtSignOptions = {
        subject: "userId",
        algorithm: "HS256",
        expiresIn: "120m"
    };

    const token = jwtService.sign({}, accessSignOptions);

    const context: any = {
        switchToHttp: () => {
            return {
                getRequest: () => {
                    return { headers: { authorization: `Bearer ${token}` } };
                }
            };
        }
    };
    const repositorySpy = jest.spyOn(clientRepo, "findById").mockResolvedValue(undefined);

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);

    expect(repositorySpy).toHaveBeenCalledTimes(1);
    expect(repositorySpy).toHaveBeenCalledWith("userId");
});

test("UserGuard canActivate - throws for unverified token", async () => {
    const accessSignOptions: JwtSignOptions = {
        subject: "app-id",
        algorithm: "HS256",
        expiresIn: "120m",
        secret: "other-secret"
    };

    const token = jwtService.sign({ tokenType: "client" }, accessSignOptions);

    const context: any = {
        switchToHttp: () => {
            return {
                getRequest: () => {
                    return { headers: { authorization: `Bearer ${token}` } };
                }
            };
        }
    };
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
});

test("UserGuard canActivate - returns true for all passing rules and updates request", async () => {
    const view = new UserView();
    view._id = new ObjectId();

    const accessSignOptions: JwtSignOptions = {
        subject: view.id,
        algorithm: "HS256",
        expiresIn: "120m"
    };

    const token = jwtService.sign({}, accessSignOptions);

    const request: any = { headers: { authorization: `Bearer ${token}` } };
    const context: any = {
        switchToHttp: () => {
            return {
                getRequest: () => {
                    return request;
                }
            };
        }
    };

    const repositorySpy = jest.spyOn(clientRepo, "findById").mockResolvedValue(view);

    const canActivate = await guard.canActivate(context);
    expect(canActivate).toBe(true);
    expect(request.userId).toBe(view.id);

    expect(repositorySpy).toHaveBeenCalledTimes(1);
    expect(repositorySpy).toHaveBeenCalledWith(view.id);
});
