import { SignatureTypes } from "../../support/blockchains/signature-types";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateListingCommand } from "./create-listing-command";
import { EntityDto } from "@swan/dto";
import { ListingFactory } from "../../domain/listing/listing-factory";
import { CategoryRepository } from "../../support/categories/category-repository";
import { BlockchainRepository } from "../../support/blockchains/blockchain-repository";
import { NftViewRepository } from "../../views/nft/nft-view-repository";
import { BadRequestException } from "@nestjs/common";
import { isNil } from "lodash";
import { LogAsyncMethod } from "../../infrastructure/logging";

@CommandHandler(CreateListingCommand)
export class CreateListingCommandExecutor implements ICommandHandler<CreateListingCommand> {
    constructor(
        private _factory: ListingFactory,
        private _categoryRepository: CategoryRepository,
        private _blockchainRepository: BlockchainRepository,
        private _nftRepository: NftViewRepository
    ) {}

    @LogAsyncMethod
    async execute(command: CreateListingCommand): Promise<EntityDto> {
        const categoryCount = await this._categoryRepository.countById(command.categoryId);
        if (categoryCount === 0) {
            throw new BadRequestException("Category is not found");
        }

        const blockchain = await this._blockchainRepository.findById(command.blockchainId);
        if (isNil(blockchain)) {
            throw new BadRequestException("Blockchain is not found");
        }

        if (!isNil(command.nftId)) {
            const nft = await this._nftRepository.findById(command.nftId);
            if (isNil(nft)) {
                throw new BadRequestException("Nft is not found");
            }

            if (nft.blockchainId !== blockchain.id) {
                throw new BadRequestException("Invalid NFT blockchain");
            }
        }

        if (blockchain.signatureType === SignatureTypes.EVM) {
            if (!command.tokenContractAddress) {
                throw new BadRequestException("Empty EVM nft contract address");
            }

            if (!command.chainTokenId) {
                throw new BadRequestException("Empty EVM nft chain token id");
            }
        } else if (blockchain.signatureType === SignatureTypes.SOLANA) {
            if (!command.nftAddress) {
                throw new BadRequestException("Empty Solana nft address");
            }
        }
        const created = this._factory.createNew(command);
        await created.commit();
        return new EntityDto(created.id, created.version);
    }
}
