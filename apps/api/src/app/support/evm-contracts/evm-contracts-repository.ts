import { Injectable } from "@nestjs/common";
import { EntityManager } from "@mikro-orm/mongodb";
import { EvmContract } from "./evm-contract";
import { EvmContractType } from "./evm-contract-type";

@Injectable()
export class EvmContractsRepository {
    constructor(private _manager: EntityManager) {}

    findAll(): Promise<Array<EvmContract>> {
        return this._manager.fork().find(EvmContract, {});
    }

    findByType(type: EvmContractType): Promise<Array<EvmContract>> {
        return this._manager.fork().find(EvmContract, { type: type });
    }

    findByTypeAndActive(type: EvmContractType, isActive = true): Promise<Array<EvmContract>> {
        return this._manager.fork().find(EvmContract, { type: type, isActive: isActive });
    }
}
