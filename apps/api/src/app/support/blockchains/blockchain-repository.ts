import { Injectable } from "@nestjs/common";
import { Blockchain } from "./blockchain";
import { Connection, MongoRepository } from "typeorm";
import { ObjectId } from "mongodb";

@Injectable()
export class BlockchainRepository {
    private _mongoRepo: MongoRepository<Blockchain>;

    constructor(connection: Connection) {
        this._mongoRepo = connection.getMongoRepository(Blockchain);
    }

    findAll(): Promise<Array<Blockchain>> {
        return this._mongoRepo.find({});
    }

    findById(id: string): Promise<Blockchain | undefined> {
        return this._mongoRepo.findOne({ _id: new ObjectId(id) });
    }
}
