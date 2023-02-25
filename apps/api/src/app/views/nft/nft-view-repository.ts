import { Injectable } from "@nestjs/common";
import { NftView } from "./nft-view";
import { MongoEntityManager } from "@mikro-orm/mongodb";

@Injectable()
export class NftViewRepository {
    constructor(private readonly _entityManager: MongoEntityManager) {}

    findByIdAndUserId(id: string, userId: string): Promise<NftView | null> {
        return this._entityManager.findOne(NftView, { id: id, userId: userId });
    }

    save(view: NftView): Promise<NftView> {
        return this._entityManager
            .fork()
            .persistAndFlush(view)
            .then(() => view);
    }

    findById(id: string): Promise<NftView | null> {
        return this._entityManager.fork().findOne(NftView, { id });
    }

    findByUserId(userId: string): Promise<Array<NftView>> {
        return this._entityManager.fork().find(NftView, { userId: userId });
    }
}
