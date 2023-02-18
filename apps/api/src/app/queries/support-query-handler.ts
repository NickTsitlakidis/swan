import { Injectable } from "@nestjs/common";
import { BlockchainDto, BlockchainWalletDto, CategoryDto, EvmContractDto, WalletDto } from "@swan/dto";
import { CategoryRepository } from "../support/categories/category-repository";
import { LogAsyncMethod } from "../infrastructure/logging";
import { BlockchainWalletRepository } from "../support/blockchains/blockchain-wallet-repository";
import { BlockchainRepository } from "../support/blockchains/blockchain-repository";
import { WalletRepository } from "../support/blockchains/wallet-repository";
import { EvmContractsRepository } from "../support/evm-contracts/evm-contracts-repository";
import { EvmContractType } from "../support/evm-contracts/evm-contract-type";

@Injectable()
export class SupportQueryHandler {
    constructor(
        private _categoryRepository: CategoryRepository,
        private _blockchainWalletRepository: BlockchainWalletRepository,
        private _evmContractRepository: EvmContractsRepository,
        private _blockchainRepository: BlockchainRepository,
        private _walletRepository: WalletRepository
    ) {}

    async getEvmMarketplaceContracts(): Promise<Array<EvmContractDto>> {
        return this._evmContractRepository.findByTypeAndActive(EvmContractType.MARKETPLACE).then((contracts) => {
            return contracts.map((c) => new EvmContractDto(c.deploymentAddress, c.blockchainId, c.isTestNetwork));
        });
    }

    async getEvmErc721Contracts(): Promise<Array<EvmContractDto>> {
        return this._evmContractRepository.findByTypeAndActive(EvmContractType.ERC721).then((contracts) => {
            return contracts.map((c) => new EvmContractDto(c.deploymentAddress, c.blockchainId, c.isTestNetwork));
        });
    }

    @LogAsyncMethod
    async getCategories(): Promise<Array<CategoryDto>> {
        const views = await this._categoryRepository.findAll();
        return views.map((view) => {
            return new CategoryDto(view.name, view.id, view.imageUrl);
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
                .map((wallet) => {
                    if (wallet) {
                        return new WalletDto(wallet.id, wallet.name, chain.id);
                    }
                })
                .filter((wallet) => wallet);

            const blockchainDto = new BlockchainDto(chain.name, chain.id, chain.chainIdHex);
            return new BlockchainWalletDto(
                blockchainDto,
                chain.mainTokenName,
                chain.mainTokenSymbol,
                chain.isTestNetwork,
                chain.rpcUrl,
                chain.scanSiteUrl,
                finalWallets
            );
        });
    }
}
