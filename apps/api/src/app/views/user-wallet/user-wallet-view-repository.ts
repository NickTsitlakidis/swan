import { Injectable } from "@nestjs/common";
import { Connection, MongoRepository } from "typeorm";
import { UserWalletView } from "./user-wallet-view";

@Injectable()
export class UserWalletViewRepository {
    private _mongoRepo: MongoRepository<UserWalletView>;

    constructor(connection: Connection) {
        this._mongoRepo = connection.getMongoRepository(UserWalletView);
    }

    findByAddressAndBlockchain(address: string, blockchainId: string): Promise<UserWalletView | undefined> {
        return this._mongoRepo.findOne({ address: address, blockchainId: blockchainId });
    }

    save(view: UserWalletView): Promise<UserWalletView> {
        return this._mongoRepo.save(view);
    }
}
