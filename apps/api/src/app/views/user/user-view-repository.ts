import { Injectable } from "@nestjs/common";
import { Connection, MongoRepository } from "typeorm";
import { UserView } from "./user-view";
import { ObjectID } from "mongodb";

@Injectable()
export class UserViewRepository {
    private _mongoRepo: MongoRepository<UserView>;

    constructor(connection: Connection) {
        this._mongoRepo = connection.getMongoRepository(UserView);
    }

    findById(id: string): Promise<UserView | undefined> {
        return this._mongoRepo.findOne({ _id: new ObjectID(id) });
    }

    save(view: UserView): Promise<UserView> {
        return this._mongoRepo.save(view);
    }
}
