import { Injectable } from "@nestjs/common";
import { Blockchain } from "./blockchain";
import { EntityManager } from "@mikro-orm/mongodb";

@Injectable()
export class BlockchainRepository {
    constructor(private _entityManager: EntityManager) {}

    findAll(): Promise<Array<Blockchain>> {
        return this._entityManager.fork().find(Blockchain, {});
    }

    findById(id: string): Promise<Blockchain | undefined> {
        return this._entityManager.fork().findOne(Blockchain, { id: id });
    }

    findByIds(ids: Array<string>): Promise<Array<Blockchain>> {
        return this._entityManager.fork().find(Blockchain, { id: { $in: ids } });
    }
}
