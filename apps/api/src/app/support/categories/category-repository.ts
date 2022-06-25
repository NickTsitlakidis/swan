import { Injectable } from "@nestjs/common";
import { Category } from "./category";
import { EntityManager } from "@mikro-orm/mongodb";

@Injectable()
export class CategoryRepository {

    constructor(private _manager: EntityManager) {
    }

    findAll(): Promise<Array<Category>> {
        return this._manager.fork().find(Category, {})
    }

    countById(id: string): Promise<number> {
        return this._manager.fork().count(Category, {id: id});
    }

    findById(id: string): Promise<Category | null> {
        return this._manager.fork().findOne(Category, {id: id});
    }
}
