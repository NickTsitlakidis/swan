import { EntityManager } from "@mikro-orm/mongodb";
import { EvmNftContract } from "./evm-nft-contract";
import { Injectable } from "@nestjs/common";

@Injectable()
export class EvmNftContractRepository {
    constructor(private _entityManager: EntityManager) {}

    findByBlockchainId(blockchainId: string): Promise<EvmNftContract[]> {
        return this._entityManager.find(EvmNftContract, { blockchainId: blockchainId });
    }
}
