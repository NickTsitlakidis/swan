import { ObjectID, ObjectIdColumn } from "typeorm";
import { ObjectID as MongoObjectId } from "mongodb";

/**
 * A base class for TypeORM document classes. Although it's not required for a document class to work, it contains
 * common id logic that will be included in documents either way.
 */
export class MongoDocument {
    @ObjectIdColumn()
    _id: ObjectID;

    get id(): string {
        return this._id.toHexString();
    }

    set id(value: string) {
        this._id = new MongoObjectId(value);
    }
}
