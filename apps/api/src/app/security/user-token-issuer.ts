import { JwtService, JwtSignOptions } from "@nestjs/jwt";
import { RefreshTokenRepository } from "./refresh-token-repository";
import { IdGenerator } from "../infrastructure/id-generator";
import { RefreshToken } from "./refresh-token";
import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { getLogger } from "../infrastructure/logging";
import { isNil } from "lodash";
import { TokenDto } from "@swan/dto";
import {DateTime} from "luxon";

@Injectable()
export class UserTokenIssuer {
    private _logger: Logger;

    constructor(
        private readonly _signService: JwtService,
        private readonly _idGenerator: IdGenerator,
        private readonly _refreshTokenRepository: RefreshTokenRepository
    ) {
        this._logger = getLogger(UserTokenIssuer);
    }

    async issueFromId(userId: string): Promise<TokenDto> {
        const refreshToken = new RefreshToken();
        refreshToken.id = this._idGenerator.generateEntityId();
        refreshToken.tokenValue = this._idGenerator.generateUUID();
        refreshToken.isRevoked = false;
        refreshToken.userId = userId;

        const saved = await this._refreshTokenRepository.save(refreshToken);

        const accessSignOptions: JwtSignOptions = {
            subject: userId,
            algorithm: "ES256",
            expiresIn: "120m"
        };

        const refreshSignOptions: JwtSignOptions = {
            subject: userId,
            algorithm: "ES256",
            jwtid: saved.tokenValue
        };

        const jwtRefreshToken = this._signService.sign({}, refreshSignOptions);

        const jwtAccessToken = this._signService.sign({}, accessSignOptions);

        return new TokenDto(jwtAccessToken, DateTime.now().toUTC().plus({minutes: 120}), jwtRefreshToken);
    }

    async issueFromRefreshToken(refreshTokenJwt: string): Promise<TokenDto> {
        let decoded: { jti: string };
        try {
            decoded = this._signService.verify(refreshTokenJwt);
        } catch (error) {
            throw new UnauthorizedException("Invalid credentials");
        }

        const found = await this._refreshTokenRepository.findByTokenValue(decoded.jti);

        if (isNil(found)) {
            throw new UnauthorizedException("Invalid credentials");
        }

        if (found.isRevoked) {
            this._logger.log(`Attempted refresh of revoked token : ${found.id}`);
            throw new UnauthorizedException("Invalid credentials");
        }

        this._logger.debug(`Refreshing token for user ${found.userId}`);

        const accessSignOptions: JwtSignOptions = {
            subject: found.userId,
            algorithm: "ES256",
            expiresIn: "120m"
        };
        const jwtAccessToken = this._signService.sign({}, accessSignOptions);

        return new TokenDto(jwtAccessToken, DateTime.now().toUTC().plus({minutes: 120}), refreshTokenJwt);
    }
}
