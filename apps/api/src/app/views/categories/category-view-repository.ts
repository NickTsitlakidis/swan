import { Injectable } from "@nestjs/common";
import { CategoryView } from "./category-view";
import { Connection, MongoRepository } from "typeorm";
import { ObjectID } from "mongodb";

@Injectable()
export class CategoryViewRepository {
    private _mongoRepo: MongoRepository<CategoryView>;

    constructor(connection: Connection) {
        this._mongoRepo = connection.getMongoRepository(CategoryView);
    }

    findAll(): Promise<Array<CategoryView>> {
        return this._mongoRepo.find({});
    }

    countById(id: string): Promise<number> {
        return this._mongoRepo.count({ _id: new ObjectID(id) });
    }
}
