import { BlockchainRepository } from "../../support/blockchains/blockchain-repository";
import { BuyListingCommand } from "./buy-listing-command";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CurrencyList, EntityDto } from "@swan/dto";
import { ListingFactory } from "../../domain/listing/listing-factory";
import { EventStore } from "../../infrastructure/event-store";
import { BadRequestException } from "@nestjs/common";
import { Buyer } from "../../domain/listing/buyer";
import { UserWalletViewRepository } from "../../views/user-wallet/user-wallet-view-repository";
import { isNil } from "lodash";
import { ethers } from "ethers";
import { NftFactory } from "../../domain/nft/nft-factory";
import { ContractFactory } from "@swan/contracts";

@CommandHandler(BuyListingCommand)
export class BuyListingCommandExecutor implements ICommandHandler<BuyListingCommand> {
    constructor(
        private _factory: ListingFactory,
        private _nftFactory: NftFactory,
        private _eventStore: EventStore,
        private _userWalletRepository: UserWalletViewRepository,
        private _contractFactory: ContractFactory,
        private _blockChainRepository: BlockchainRepository
    ) {}

    async execute(command: BuyListingCommand): Promise<EntityDto> {
        const events = await this._eventStore.findEventsByAggregateId(command.listingId);

        if (events.length == 0) {
            throw new BadRequestException(`No listing with id ${command.listingId}`);
        }

        const listing = this._factory.createFromEvents(command.listingId, events);

        const userWallet = await this._userWalletRepository.findByUserIdAndWalletIdAndChainId(
            command.userId,
            command.walletId,
            listing.blockchainId
        );

        if (isNil(userWallet)) {
            throw new BadRequestException(
                `No user-wallet was found. Input: User (${command.userId}) - Wallet (${command.walletId}) - Blockchain (${listing.blockchainId})`
            );
        }

        const blockchain = await this._blockChainRepository.findById(listing.blockchainId);

        if (isNil(blockchain)) {
            throw new BadRequestException(`No blockchain was found. Input: Blockchain (${listing.blockchainId})`);
        }

        const customHttpProvider = new ethers.providers.JsonRpcProvider(blockchain.rpcUrl);
        const swanMarketPlace = this._contractFactory.createMarketplace(
            customHttpProvider,
            listing.marketPlaceContractAddress
        );
        const fee = await swanMarketPlace.getFeePercentage();

        const buyer: Buyer = new Buyer(command.userId, userWallet.walletId, userWallet.address);
        listing.buy(
            command.chainTransactionHash,
            buyer,
            fee,
            CurrencyList[blockchain.mainTokenName],
            command.blockNumber
        );
        await listing.commit();

        const nftEvents = await this._eventStore.findEventsByAggregateId(listing.nftId);
        const nft = this._nftFactory.createFromEvents(listing.nftId, nftEvents);
        nft.changeUser(command.userId, userWallet.id);

        await nft.commit();
        return new EntityDto(listing.id, listing.version);
    }
}
