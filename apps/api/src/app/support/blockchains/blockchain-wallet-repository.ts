import { Injectable } from "@nestjs/common";
import { BlockchainWallet } from "./blockchain-wallet";
import { EntityManager } from "@mikro-orm/mongodb";

@Injectable()
export class BlockchainWalletRepository {

    constructor(private _entityManager: EntityManager) {
    }

    findAll(): Promise<Array<BlockchainWallet>> {
        return this._entityManager.find(BlockchainWallet,{});
    }

    findByWalletIdAndBlockchainId(walletId: string, chainId: string): Promise<BlockchainWallet | undefined> {
        return this._entityManager.findOne(BlockchainWallet,{ blockchainId: chainId, walletId: walletId });
    }
}
