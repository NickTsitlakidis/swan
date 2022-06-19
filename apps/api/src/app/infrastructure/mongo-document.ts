import { PrimaryKey } from "@mikro-orm/core";
import { ObjectId } from "@mikro-orm/mongodb";

export class MongoDocument {
    @PrimaryKey()
    _id!: ObjectId;

    get id(): string {
        return this._id.toHexString();
    }
    set id(value: string) {
        this._id = new ObjectId(value);
    }
}
