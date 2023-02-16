import { Injectable } from "@nestjs/common";
import { Wallet } from "./wallet";
import { EntityManager } from "@mikro-orm/mongodb";

@Injectable()
export class WalletRepository {
    constructor(private entityManager: EntityManager) {}

    findAll(): Promise<Array<Wallet>> {
        return this.entityManager.find(Wallet, {});
    }

    findById(id: string): Promise<Wallet | null> {
        return this.entityManager.findOne(Wallet, { id: id });
    }
}
