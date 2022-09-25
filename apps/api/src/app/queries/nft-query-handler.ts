import { CategoryRepository } from "../support/categories/category-repository";
import { BlockchainActionsRegistryService } from "../support/blockchains/blockchain-actions-registry-service";
import { Injectable } from "@nestjs/common";
import { BlockchainDto, CategoryDto, CollectionDto, ProfileNftDto } from "@swan/dto";
import { UserWalletViewRepository } from "../views/user-wallet/user-wallet-view-repository";
import { BlockchainRepository } from "../support/blockchains/blockchain-repository";
import { NftViewRepository } from "../views/nft/nft-view-repository";
import { CollectionViewRepository } from "../views/collection/collection-view-repository";
import { unique } from "radash";
import { LogAsyncMethod } from "../infrastructure/logging";
import { isNil } from "lodash";

@Injectable()
export class NftQueryHandler {
    constructor(
        private _userWalletRepository: UserWalletViewRepository,
        private _blockchainRepository: BlockchainRepository,
        private _blockchainActions: BlockchainActionsRegistryService,
        private _categoryRepository: CategoryRepository,
        private _nftViewRepository: NftViewRepository,
        private _collectionViewRepository: CollectionViewRepository
    ) {}

    @LogAsyncMethod
    async getByUserId(userId: string): Promise<Array<ProfileNftDto>> {
        const nfts = await this._nftViewRepository.findByUserId(userId);

        const collectionIds = unique(nfts.map((view) => view.collectionId));
        const userWalletIds = unique(nfts.map((view) => view.userWalletId));

        const [collections, categories, blockchains, userWallets] = await Promise.all([
            this._collectionViewRepository.findByIds(collectionIds),
            this._categoryRepository.findAll(),
            this._blockchainRepository.findAll(),
            this._userWalletRepository.findByIds(userWalletIds)
        ]);

        return nfts.map((view) => {
            const dto = new ProfileNftDto();

            const category = categories.find((cat) => cat.id === view.categoryId);
            dto.category = new CategoryDto(category.name, category.id, category.imageUrl);

            const blockchain = blockchains.find((b) => b.id === view.blockchainId);
            dto.blockchain = new BlockchainDto(blockchain.name, blockchain.id, blockchain.chainIdHex);

            dto.id = view.id;
            dto.walletId = userWallets.find((userWallet) => userWallet.id === view.userWalletId)?.walletId;
            dto.imageUri = view.fileUri;

            dto.tokenId = view.tokenId;
            dto.tokenContractAddress = view.tokenContractAddress;

            dto.nftAddress = view.nftAddress;

            const collection = collections.find((c) => c.id === view.collectionId);
            if (!isNil(collection)) {
                dto.collection = new CollectionDto();
                dto.collection.id = collection.id;
                dto.collection.categoryId = collection.categoryId;
                dto.collection.customUrl = collection.customUrl;
                dto.collection.description = collection.description;
                dto.collection.isExplicit = collection.isExplicit;
                dto.collection.imageUrl = collection.imageUrl;
                dto.collection.salePercentage = collection.salePercentage;
                dto.collection.blockchainId = collection.blockchainId;
                dto.collection.paymentToken = collection.imageUrl;
                dto.collection.salePercentage = collection.salePercentage;
            }

            return dto;
        });
    }

    @LogAsyncMethod
    async getExternalByUserId(userId: string): Promise<Array<ProfileNftDto>> {
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
