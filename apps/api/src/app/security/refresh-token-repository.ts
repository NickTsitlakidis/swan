import { Injectable } from "@nestjs/common";
import { RefreshToken } from "./refresh-token";
import { EntityManager } from "@mikro-orm/mongodb";

@Injectable()
export class RefreshTokenRepository {
    constructor(private _entityManager: EntityManager) {}

    async save(token: RefreshToken): Promise<RefreshToken> {
        return this._entityManager
            .fork()
            .persistAndFlush([token])
            .then(() => token);
    }

    findByTokenValue(tokenValue: string): Promise<RefreshToken | null> {
        return this._entityManager.fork().findOne(RefreshToken, { tokenValue: tokenValue });
    }
}
