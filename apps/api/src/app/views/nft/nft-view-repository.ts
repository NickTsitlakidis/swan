import { Injectable } from "@nestjs/common";
import { NftView } from "./nft-view";
import { MongoEntityManager } from "@mikro-orm/mongodb";

@Injectable()
export class NftViewRepository {

    constructor(private readonly _entityManager: MongoEntityManager) {
    }

    findByIdAndUserId(id: string, userId: string): Promise<NftView | undefined> {
        return this._entityManager.findOne(NftView, {id: id, userId: userId});
    }
}