import { Injectable } from "@nestjs/common";
import { Connection, MongoRepository } from "typeorm";
import { WalletView } from "./wallet-view";
import { Blockchains } from "@nft-marketplace/common";

@Injectable()
export class WalletViewRepository {
    private _mongoRepo: MongoRepository<WalletView>;

    constructor(connection: Connection) {
        this._mongoRepo = connection.getMongoRepository(WalletView);
    }

    findByAddressAndBlockchain(address: string, blockchain: Blockchains): Promise<WalletView | undefined> {
        return this._mongoRepo.findOne({ address: address, blockchain: blockchain });
    }

    save(view: WalletView): Promise<WalletView> {
        return this._mongoRepo.save(view);
    }
}
