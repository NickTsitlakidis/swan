import { Injectable } from "@nestjs/common";
import { CollectionView } from "./collection-view";
import { Connection, MongoRepository } from "typeorm";
import {ObjectID as MongoObjectId} from "mongodb";

@Injectable()
export class CollectionViewRepository {
    private _mongoRepo: MongoRepository<CollectionView>; // todo ask

    constructor(connection: Connection) {
        this._mongoRepo = connection.getMongoRepository(CollectionView);
    }

    findAll(): Promise<Array<CollectionView>> {
        return this._mongoRepo.find({});
    }

    findOne(id: string): Promise<CollectionView> {
        return this._mongoRepo.findOne({_id: new MongoObjectId(id)}) // todo ask
    }
}
