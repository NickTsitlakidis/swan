import { BeforeInsert, ObjectID, ObjectIdColumn } from "typeorm";
import { ObjectID as MongoObjectId } from "mongodb";
import { isNil, keys } from "lodash";

/**
 * A base class for TypeORM document classes. Extending the class will allow documents to avoid having null values in
 * the database when a field is undefined or null. Additionally, the class provides the _id field with conversions
 * from/to string/object id
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

    @BeforeInsert()
    removeUnsetValues() {
        keys(this).forEach((key) => {
            if (isNil(this[key])) {
                delete this[key];
            }
        });
    }
}
