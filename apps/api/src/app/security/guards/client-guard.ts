import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { isNil } from "@nft-marketplace/utils";
import { ClientRepository } from "../client-repository";
import { getLogger } from "../../infrastructure/logging";
import { extractBearerValue } from "./token-utils";

@Injectable()
export class ClientGuard implements CanActivate {
    private _logger: Logger;

    constructor(private _signingService: JwtService, private _clientRepository: ClientRepository) {
        this._logger = getLogger(ClientGuard);
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const token = extractBearerValue(context);
        if (isNil(token)) {
            throw new UnauthorizedException("Invalid or missing credentials");
        }
        let verified;

        try {
            verified = this._signingService.verify(token);
        } catch (error) {
            this._logger.error(`Detected unverified or expired client token ${token}`);
            throw new UnauthorizedException("Invalid or missing credentials");
        }

        const found = await this._clientRepository.findByApplicationId(verified.sub);
        if (isNil(found)) {
            throw new UnauthorizedException("Invalid or missing credentials");
        }
        return true;
    }
}
