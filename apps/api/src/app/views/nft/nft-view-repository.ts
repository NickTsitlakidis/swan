import { Injectable } from "@nestjs/common";
import { NftView } from "./nft-view";
import { Connection, MongoRepository } from "typeorm";

@Injectable()
export class NftViewRepository {
    private mongoRepo: MongoRepository<NftView>;

    constructor(connection: Connection) {
        this.mongoRepo = connection.getMongoRepository(NftView);
    }

    findByIdAndUserId(id: string, userId: string): Promise<NftView | undefined> {
        return this.mongoRepo.findOne({id: id, userId: userId});
    }
}