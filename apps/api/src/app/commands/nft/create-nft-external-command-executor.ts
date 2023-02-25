import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { NftFactory } from "../../domain/nft/nft-factory";
import { CategoryRepository } from "../../support/categories/category-repository";
import { UserWalletViewRepository } from "../../views/user-wallet/user-wallet-view-repository";
import { BadRequestException } from "@nestjs/common";
import { BlockchainRepository } from "../../support/blockchains/blockchain-repository";
import { NftDto } from "@swan/dto";
import { isNil } from "lodash";
import { LogAsyncMethod } from "../../infrastructure/logging";
import { CreateNftExternalCommand } from "./create-nft-external-command";
import { BlockchainActionsRegistryService } from "../../support/blockchains/blockchain-actions-registry-service";

@CommandHandler(CreateNftExternalCommand)
export class CreateNftExternalCommandExecutor implements ICommandHandler<CreateNftExternalCommand> {
    constructor(
        private _categoryRepository: CategoryRepository,
        private _blockchainRepository: BlockchainRepository,
        private _walletRepository: UserWalletViewRepository,
        private _factory: NftFactory,
        private _blockchainActionsRegistryService: BlockchainActionsRegistryService
    ) {}

    @LogAsyncMethod
    async execute(command: CreateNftExternalCommand): Promise<NftDto> {
        const [category, wallet, blockchain] = await Promise.all([
            this._categoryRepository.findById(command.categoryId),
            this._walletRepository.findByUserIdAndWalletIdAndChainId(
                command.userId,
                command.walletId,
                command.blockchainId
            ),
            this._blockchainRepository.findById(command.blockchainId)
        ]);

        if (isNil(category) || isNil(wallet) || isNil(blockchain)) {
            throw new BadRequestException("Missing category, wallet, blockchain or collection");
        }

        const blockChainService = await this._blockchainActionsRegistryService.getService(blockchain.id);
        const transactions = await blockChainService?.fetchNftTransactions({
            tokenAdress: command.nftAddress || command.tokenContractAddress,
            tokenId: parseInt(command.tokenId),
            rpcUrl: blockchain.rpcUrl,
            chainId: blockchain.chainIdDecimal
        });

        const transactionId = transactions?.at(0)?.transactionId;

        const newNft = this._factory.createExternal(command.userId, {
            blockchainId: command.blockchainId,
            categoryId: command.categoryId,
            userWalletId: wallet.id,
            tokenId: command.tokenId?.toString(),
            tokenAddress: command.nftAddress || command.tokenContractAddress,
            transactionId: transactionId
        });

        await newNft.commit();
        return new NftDto(newNft.metadataUri, newNft.id);
    }
}
