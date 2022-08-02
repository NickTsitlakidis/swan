import { BlockchainActionsRegistryService } from "../support/blockchains/blockchain-actions-registry-service";
import { Injectable } from "@nestjs/common";
import { ProfileNftDto } from "@nft-marketplace/common";
import { UserWalletViewRepository } from "../views/user-wallet/user-wallet-view-repository";
import { BlockchainRepository } from "../support/blockchains/blockchain-repository";

@Injectable()
export class NftQueryHandler {
    constructor(
        private _userWalletRepository: UserWalletViewRepository,
        private _blockchainRepository: BlockchainRepository,
        private _blockchainActions: BlockchainActionsRegistryService
    ) {}

    async getByUserId(userId: string): Promise<Array<ProfileNftDto>> {
        const userWallets = await this._userWalletRepository.findByUserId(userId);

        const chains = await this._blockchainRepository.findByIds(userWallets.map((wallet) => wallet.blockchainId));

        let profileNfts = [];
        for (const wallet of userWallets) {
            const service = await this._blockchainActions.getService(wallet.blockchainId);
            const nfts = await service.getUserNfts(wallet.address);
            const chain = chains.find((c) => c.id === wallet.blockchainId);
            profileNfts = profileNfts.concat(
                nfts.map((nft) => {
                    const profileNftDto = new ProfileNftDto();
                    profileNftDto.blockchain = {
                        id: chain.id,
                        name: chain.name
                    };
                    /* profileNftDto.collection = {
                        name: nft.collection.name
                    }; */
                    profileNftDto.fileType = nft.properties.files.at(0).type;
                    profileNftDto.fileUri = nft.properties.files.at(0).uri;
                    // TODO
                    profileNftDto.isListed = false;
                    return profileNftDto;
                })
            );
        }
        return profileNfts;
    }
}
