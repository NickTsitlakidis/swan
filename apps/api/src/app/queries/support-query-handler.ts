import { Injectable } from "@nestjs/common";
import { CategoryDto, BlockchainWalletDto, WalletDto } from "@nft-marketplace/common";
import { CategoryRepository } from "../support/categories/category-repository";
import { LogAsyncMethod } from "../infrastructure/logging";
import { BlockchainWalletRepository } from "../support/blockchains/blockchain-wallet-repository";
import { BlockchainRepository } from "../support/blockchains/blockchain-repository";
import { WalletRepository } from "../support/blockchains/wallet-repository";

@Injectable()
export class SupportQueryHandler {
    constructor(
        private _categoryRepository: CategoryRepository,
        private _blockchainWalletRepository: BlockchainWalletRepository,
        private _blockchainRepository: BlockchainRepository,
        private _walletRepository: WalletRepository
    ) {}

    @LogAsyncMethod
    async getCategories(): Promise<Array<CategoryDto>> {
        const views = await this._categoryRepository.findAll();
        return views.map((view) => {
            return new CategoryDto(view.name, view.imageUrl, view.id);
        });
    }

    @LogAsyncMethod
    async getBlockchainWallets(): Promise<Array<BlockchainWalletDto>> {
        const blockchainWallets = await this._blockchainWalletRepository.findAll();
        const blockchains = await this._blockchainRepository.findAll();
        const wallets = await this._walletRepository.findAll();

        return blockchains.map((chain) => {
            const finalWallets = blockchainWallets
                .filter((pair) => pair.blockchainId === chain.id)
                .map((pair) => wallets.find((wallet) => wallet.id === pair.walletId))
                .filter((wallet) => wallet)
                .map((wallet) => new WalletDto(wallet.id, wallet.name, chain.id));

            return new BlockchainWalletDto(
                chain.id,
                chain.name,
                chain.mainTokenName,
                chain.mainTokenSymbol,
                chain.isTestNetwork,
                chain.rpcUrl,
                chain.scanSiteUrl,
                chain.chainId,
                finalWallets
            );
        });
    }
}
