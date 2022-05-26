import { Injectable } from "@nestjs/common";
import { Blockchain } from "./blockchain";
import { Connection, MongoRepository } from "typeorm";

@Injectable()
export class BlockchainRepository {
    private _mongoRepo: MongoRepository<Blockchain>;

    constructor(connection: Connection) {
        this._mongoRepo = connection.getMongoRepository(Blockchain);
    }

    findAll(): Promise<Array<Blockchain>> {
        return this._mongoRepo.find({});
    }
}
