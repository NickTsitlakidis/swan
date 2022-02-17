import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { getLogger } from "../../infrastructure/logging";
import { UserViewRepository } from "../../views/user/user-view-repository";
import { isNil, startsWith } from "lodash";

@Injectable()
export class UserGuard implements CanActivate {
    private _logger: Logger;

    constructor(private _signingService: JwtService, private _userViewRepository: UserViewRepository) {
        this._logger = getLogger(UserGuard);
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
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
            this._logger.error(`Detected unverified token ${token}`);
            throw new UnauthorizedException("Invalid or missing credentials");
        }

        const nowEpoch = Math.floor(new Date().getTime() / 1000);

        if (nowEpoch < verified.exp) {
            const found = await this._userViewRepository.findById(verified.sub);
            if (isNil(found)) {
                throw new UnauthorizedException("Invalid or missing credentials");
            }
            return true;
        } else {
            throw new UnauthorizedException("Invalid or missing credentials");
        }
    }
}
