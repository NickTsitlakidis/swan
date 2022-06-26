import { Injectable } from "@nestjs/common";
import { CollectionView } from "./collection-view";
import { EntityManager } from "@mikro-orm/mongodb";

@Injectable()
export class CollectionViewRepository {
    constructor(private _entityManager: EntityManager) {}

    countByName(name: string): Promise<number> {
        return this._entityManager.fork().count(CollectionView, { name: name });
    }

    countByCustomUrl(url: string): Promise<number> {
        return this._entityManager.fork().count(CollectionView, { customUrl: url });
    }

    save(view: CollectionView): Promise<CollectionView> {
        return this._entityManager.persistAndFlush(view).then(() => view);
    }

    findOne(id: string): Promise<CollectionView> {
        return this._entityManager.fork().findOne(CollectionView, { id: id });
    }

    findByUserIdAndId(userId: string, id: string): Promise<CollectionView | null> {
        return this._entityManager.fork().findOne(CollectionView, { id: id, userId: userId });
    }
}
