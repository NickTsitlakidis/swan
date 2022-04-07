import { Injectable } from "@nestjs/common";
import { Connection, MongoRepository } from "typeorm";
import { CollectionView } from "./collection-view";

@Injectable()
export class CollectionViewRepository {
    private _mongoRepo: MongoRepository<CollectionView>;

    constructor(connection: Connection) {
        this._mongoRepo = connection.getMongoRepository(CollectionView);
    }

    countByName(name: string): Promise<number> {
        return this._mongoRepo.count({ name: name });
    }

    countByCustomUrl(url: string): Promise<number> {
        return this._mongoRepo.count({ customUrl: url });
    }

    save(view: CollectionView): Promise<CollectionView> {
        return this._mongoRepo.save(view);
    }
}
