import { Injectable } from "@nestjs/common";
import { ListingView } from "./listing-view";
import { MongoEntityManager } from "@mikro-orm/mongodb";

@Injectable()
export class ListingViewRepository {
    constructor(private readonly _entityManager: MongoEntityManager) {}

    findByIdAndUserId(id: string, userId: string): Promise<ListingView | undefined> {
        return this._entityManager.findOne(ListingView, { id: id, userId: userId });
    }

    save(view: ListingView): Promise<ListingView> {
        return this._entityManager.persistAndFlush(view).then(() => view);
    }

    findById(id: string): Promise<ListingView | undefined> {
        return this._entityManager.findOne(ListingView, { id });
    }
}
