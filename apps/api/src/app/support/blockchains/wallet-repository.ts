import { Injectable } from "@nestjs/common";
import { Wallet } from "./wallet";
import { Connection, MongoRepository } from "typeorm";
import { ObjectId } from "mongodb";

@Injectable()
export class WalletRepository {
    private _mongoRepo: MongoRepository<Wallet>;

    constructor(connection: Connection) {
        this._mongoRepo = connection.getMongoRepository(Wallet);
    }

    findAll(): Promise<Array<Wallet>> {
        return this._mongoRepo.find({});
    }

    findById(id: string): Promise<Wallet | undefined> {
        return this._mongoRepo.findOne({ _id: new ObjectId(id) });
    }
}
