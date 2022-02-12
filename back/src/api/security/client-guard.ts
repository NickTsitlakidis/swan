import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { isNil, startsWith } from "lodash";

@Injectable()
export class ClientGuard implements CanActivate {
    private clientIds = ["id1", "123"];

    constructor(private _signingService: JwtService) {}

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();

        if (
            isNil(request) ||
            isNil(request.headers) ||
            isNil(request.headers.authorization) ||
            !startsWith(request.headers.authorization, "Bearer ")
        ) {
            throw new UnauthorizedException("Invalid or missing credentials");
        }

        const token = request.headers.authorization.replace("Bearer ", "");
        let verified;

        try {
            verified = this._signingService.verify(token);
        } catch (error) {
            throw new UnauthorizedException("Invalid or missing credentials");
        }

        const nowEpoch = Math.floor(new Date().getTime() / 1000);

        if (nowEpoch < verified.exp && verified.tokenType === "client") {
            return this.clientIds.includes(verified.sub);
        } else {
            throw new UnauthorizedException("Invalid or missing credentials");
        }
    }
}
