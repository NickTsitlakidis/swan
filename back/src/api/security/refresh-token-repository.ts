import { Injectable } from "@nestjs/common";
import { RefreshToken } from "./refresh-token";
import { Connection, MongoRepository } from "typeorm";

@Injectable()
export class RefreshTokenRepository {
    private _mongoRepo: MongoRepository<RefreshToken>;

    constructor(connection: Connection) {
        this._mongoRepo = connection.getMongoRepository(RefreshToken);
    }

    save(token: RefreshToken): Promise<RefreshToken> {
        return this._mongoRepo.save(token);
    }

    findByTokenValue(tokenValue: string): Promise<RefreshToken | undefined> {
        return this._mongoRepo.findOne({ where: { tokenValue: tokenValue } });
    }
}
