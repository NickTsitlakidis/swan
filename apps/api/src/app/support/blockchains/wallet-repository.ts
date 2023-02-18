import { Injectable } from "@nestjs/common";
import { Wallet } from "./wallet";
import { EntityManager } from "@mikro-orm/mongodb";

@Injectable()
export class WalletRepository {
    constructor(private entityManager: EntityManager) {}

    findAll(): Promise<Array<Wallet>> {
        return this.entityManager.find(Wallet, { enabled: true });
    }

    findById(id: string): Promise<Wallet | undefined> {
        return this.entityManager.findOne(Wallet, { id, enabled: true });
    }
}
