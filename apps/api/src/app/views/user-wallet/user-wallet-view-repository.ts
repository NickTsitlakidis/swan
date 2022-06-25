import { Injectable } from "@nestjs/common";
import { UserWalletView } from "./user-wallet-view";
import { EntityManager } from "@mikro-orm/mongodb";

@Injectable()
export class UserWalletViewRepository {
    constructor(private _entityManager: EntityManager) {}

    findByAddressAndBlockchain(address: string, blockchainId: string): Promise<UserWalletView | null> {
        return this._entityManager.fork().findOne(UserWalletView, { address: address, blockchainId: blockchainId });
    }

    findByUserIdAndWalletIdAndChainId(userId: string, walletId: string, chainId: string): Promise<UserWalletView | null> {
        return this._entityManager.fork().findOne(UserWalletView, { userId, walletId, blockchainId: chainId });
    }

    save(view: UserWalletView): Promise<UserWalletView> {
        return this._entityManager.persistAndFlush(view).then(() => view);
    }
}
