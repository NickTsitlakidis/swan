import { Injectable } from "@nestjs/common";
import { ProfileNftDto } from "@nft-marketplace/common";
import { UserWalletViewRepository } from "../views/user-wallet/user-wallet-view-repository";
import { BlockchainRepository } from "../support/blockchains/blockchain-repository";

@Injectable()
export class NftQueryHandler {
    constructor(
        private _userWalletRepository: UserWalletViewRepository,
        private _blockchainRepository: BlockchainRepository
    ) {}

    /* async getByUserId(userId: string): Promise<Array<ProfileNftDto>> {
        const userWallets = await this._userWalletRepository.findByUserId(userId);

        const chains = await this._blockchainRepository.findByIds(userWallets.map((wallet) => wallet.blockchainId));
    } */
}
