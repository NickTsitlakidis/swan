import { Injectable } from "@nestjs/common";
import { Category } from "./category";
import { Connection, MongoRepository } from "typeorm";
import { ObjectID } from "mongodb";

@Injectable()
export class CategoryRepository {
    private _mongoRepo: MongoRepository<Category>;

    constructor(connection: Connection) {
        this._mongoRepo = connection.getMongoRepository(Category);
    }

    findAll(): Promise<Array<Category>> {
        return this._mongoRepo.find({});
    }

    countById(id: string): Promise<number> {
        return this._mongoRepo.count({ _id: new ObjectID(id) });
    }
}
