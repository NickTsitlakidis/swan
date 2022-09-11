import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { getLogger } from "../../infrastructure/logging";
import { UserViewRepository } from "../../views/user/user-view-repository";
import { isNil } from "lodash";
import { extractBearerValue, hasBearerToken } from "./token-utils";
import { UserView } from "../../views/user/user-view";

@Injectable()
export class UserGuard implements CanActivate {
    private _logger: Logger;

    constructor(private _signingService: JwtService, private _userViewRepository: UserViewRepository) {
        this._logger = getLogger(UserGuard);
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        if (!hasBearerToken(context)) {
            throw new UnauthorizedException("Invalid or missing credentials");
        }
        const token = extractBearerValue(context);
        let verified;

        try {
            // todo:  Error ? 'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
            verified = this._signingService.verify(extractBearerValue(context));
        } catch (error) {
            this._logger.error(`Detected unverified or expired user token ${token}`);
            throw new UnauthorizedException("Invalid or missing credentials");
        }

        let found: UserView;
        try {
            found = await this._userViewRepository.findById(verified.sub);
        } catch {
            throw new UnauthorizedException("Invalid or missing user credentials");
        }

        if (isNil(found)) {
            throw new UnauthorizedException("Invalid or missing user credentials");
        }

        request.userId = verified.sub;
        return true;
    }
}
