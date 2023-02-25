import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { getLogger } from "../../infrastructure/logging";
import { UserViewRepository } from "../../views/user/user-view-repository";
import { isNil } from "lodash";
import { extractBearerValue } from "./token-utils";

@Injectable()
export class UserGuard implements CanActivate {
    private _logger: Logger;

    constructor(private _signingService: JwtService, private _userViewRepository: UserViewRepository) {
        this._logger = getLogger(UserGuard);
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        const token = extractBearerValue(context);
        if (isNil(token)) {
            throw new UnauthorizedException("Invalid or missing credentials");
        }
        let verified;

        try {
            verified = this._signingService.verify(token);
        } catch (error) {
            this._logger.error(`Detected unverified or expired user token ${token}`);
            throw new UnauthorizedException("Invalid or missing credentials");
        }

        const found = await this._userViewRepository.findById(verified.sub);

        if (isNil(found)) {
            throw new UnauthorizedException("Invalid or missing user credentials");
        }

        request.userId = verified.sub;
        return true;
    }
}
