import { Injectable } from "@nestjs/common";
import { BlockchainWallet } from "./blockchain-wallet";
import { Connection, MongoRepository } from "typeorm";

@Injectable()
export class BlockchainWalletRepository {
    private _mongoRepo: MongoRepository<BlockchainWallet>;

    constructor(connection: Connection) {
        this._mongoRepo = connection.getMongoRepository(BlockchainWallet);
    }

    findAll(): Promise<Array<BlockchainWallet>> {
        return this._mongoRepo.find({});
    }
}
