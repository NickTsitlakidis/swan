import { CategoryRepository } from "./../support/categories/category-repository";
import { BlockchainActionsRegistryService } from "../support/blockchains/blockchain-actions-registry-service";
import { Injectable } from "@nestjs/common";
import { BlockchainDto, ProfileNftDto } from "@swan/dto";
import { UserWalletViewRepository } from "../views/user-wallet/user-wallet-view-repository";
import { BlockchainRepository } from "../support/blockchains/blockchain-repository";

@Injectable()
export class NftQueryHandler {
    constructor(
        private _userWalletRepository: UserWalletViewRepository,
        private _blockchainRepository: BlockchainRepository,
        private _blockchainActions: BlockchainActionsRegistryService,
        private _categoryRepository: CategoryRepository
    ) {}

    async getByUserId(userId: string): Promise<Array<ProfileNftDto>> {
        const userWallets = await this._userWalletRepository.findByUserId(userId);

        const chains = await this._blockchainRepository.findByIds(userWallets.map((wallet) => wallet.blockchainId));
        const categories = await this._categoryRepository.findAll();

        let profileNfts = [];
        for (const wallet of userWallets) {
            const service = await this._blockchainActions.getService(wallet.blockchainId);
            const nfts = await service.getUserNfts(wallet.address, wallet.blockchainId);
            const chain = chains.find((c) => c.id === wallet.blockchainId);
            profileNfts = profileNfts.concat(
                nfts.map((nft) => {
                    const category = categories.find((cat) => cat.id === nft.categoryId);
                    const profileNftDto = new ProfileNftDto();
                    profileNftDto.blockchain = new BlockchainDto(chain.name, chain.id, chain.chainIdHex);
                    profileNftDto.category = {
                        id: category?.id,
                        name: category?.name
                    };
                    /* profileNftDto.collection = {
                        name: nft.collection.name
                    }; */
                    profileNftDto.animationUri = nft.animation_url;
                    profileNftDto.imageUri = nft.image;
                    // TODO
                    profileNftDto.isListed = false;
                    profileNftDto.tokenId = nft.tokenId;
                    profileNftDto.tokenContractAddress = nft.tokenContractAddress;
                    profileNftDto.nftAddress = nft.nftAddress;
                    profileNftDto.walletId = wallet.walletId;
                    return profileNftDto;
                })
            );
        }
        return profileNfts;
    }
}
