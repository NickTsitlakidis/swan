import { Injectable } from "@nestjs/common";
import { Client } from "./client";
import { EntityManager } from "@mikro-orm/mongodb";

@Injectable()
export class ClientRepository {
    constructor(private _entityManager: EntityManager) {}

    findByApplicationId(id: string): Promise<Client | null> {
        return this._entityManager.fork().findOne(Client, { applicationId: id });
    }
}
