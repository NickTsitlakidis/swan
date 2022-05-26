import { Injectable } from "@nestjs/common";
import { Wallet } from "./wallet";
import { Connection, MongoRepository } from "typeorm";

@Injectable()
export class WalletRepository {
    private _mongoRepo: MongoRepository<Wallet>;

    constructor(connection: Connection) {
        this._mongoRepo = connection.getMongoRepository(Wallet);
    }

    findAll(): Promise<Array<Wallet>> {
        return this._mongoRepo.find({});
    }
}
