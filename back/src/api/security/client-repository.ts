import { Injectable } from "@nestjs/common";
import { Connection, MongoRepository } from "typeorm";
import { Client } from "./client";

@Injectable()
export class ClientRepository {
    private _mongoRepo: MongoRepository<Client>;

    constructor(connection: Connection) {
        this._mongoRepo = connection.getMongoRepository(Client);
    }

    findByApplicationId(id: string): Promise<Client> {
        return this._mongoRepo.findOne({ applicationId: id });
    }
}
