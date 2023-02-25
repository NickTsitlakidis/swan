import { Injectable } from "@nestjs/common";
import { Blockchain } from "./blockchain";
import { EntityManager } from "@mikro-orm/mongodb";
import { FilterQuery } from "@mikro-orm/core";
import { ConfigService } from "@nestjs/config";
import { EnvBlockChainType } from "@swan/dto";

@Injectable()
export class BlockchainRepository {
    constructor(private _entityManager: EntityManager, private _configService: ConfigService) {}

    findAll(): Promise<Array<Blockchain>> {
        let mongoQ: FilterQuery<Blockchain> = { enabled: true };
        mongoQ = this._addOnlyMainnnets(mongoQ);
        return this._entityManager.fork().find(Blockchain, mongoQ);
    }

    findById(id: string): Promise<Blockchain | null> {
        let mongoQ: FilterQuery<Blockchain> = { id, enabled: true };
        mongoQ = this._addOnlyMainnnets(mongoQ);
        return this._entityManager.fork().findOne(Blockchain, mongoQ);
    }

    findByIds(ids: Array<string>): Promise<Array<Blockchain>> {
        let mongoQ: FilterQuery<Blockchain> = { id: { $in: ids }, enabled: true };
        mongoQ = this._addOnlyMainnnets(mongoQ);
        return this._entityManager.fork().find(Blockchain, mongoQ);
    }

    private _addOnlyMainnnets(mongoQ: FilterQuery<Blockchain>): FilterQuery<Blockchain> {
        switch (this._configService.get("BLOCKCHAIN_TYPE")) {
            case EnvBlockChainType.MAIN:
                return Object.assign({ isTestNetwork: false }, mongoQ);
            case EnvBlockChainType.TEST:
                return Object.assign({ isTestNetwork: true }, mongoQ);
            default:
                return mongoQ;
        }
    }
}
