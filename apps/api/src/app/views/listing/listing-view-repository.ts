import { Injectable } from "@nestjs/common";
import { ListingView } from "./listing-view";
import { MongoEntityManager } from "@mikro-orm/mongodb";
import { ListingStatus } from "../../domain/listing/listing-status";

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

    findAllActive(skip = 0, limit = 50): Promise<[ListingView[], number]> {
        return this._entityManager.findAndCount(ListingView, { status: ListingStatus.ACTIVE }, { limit, offset: skip });
    }
}
