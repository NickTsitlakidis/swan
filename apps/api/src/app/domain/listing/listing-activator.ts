import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { ListingSubmittedEvent } from "./listing-events";
import { EventStore } from "../../infrastructure/event-store";
import { ListingFactory } from "./listing-factory";
import { getLogger, LogAsyncMethod } from "../../infrastructure/logging";
import { ContractFactory } from "@swan/contracts";
import { BlockchainRepository } from "../../support/blockchains/blockchain-repository";
import { ethers } from "ethers";
import { SignatureTypes } from "../../support/blockchains/signature-types";
import { UserWalletViewRepository } from "../../views/user-wallet/user-wallet-view-repository";
import { ListingViewRepository } from "../../views/listing/listing-view-repository";
import { EvmContractsRepository } from "../../support/evm-contracts/evm-contracts-repository";
import { EvmContractType } from "../../support/evm-contracts/evm-contract-type";
import { isNil } from "@nft-marketplace/utils";
import { InternalServerErrorException, Logger } from "@nestjs/common";

@EventsHandler(ListingSubmittedEvent)
export class ListingActivator implements IEventHandler<ListingSubmittedEvent> {
    private _logger: Logger;

    constructor(
        private _eventStore: EventStore,
        private _listingFactory: ListingFactory,
        private _listingViewRepository: ListingViewRepository,
        private _contractFactory: ContractFactory,
        private _blockchainRepository: BlockchainRepository,
        private _userWalletRepository: UserWalletViewRepository,
        private _evmContractsRepository: EvmContractsRepository
    ) {
        this._logger = getLogger(ListingActivator);
    }

    @LogAsyncMethod
    async handle(event: ListingSubmittedEvent): Promise<unknown> {
        const view = await this._listingViewRepository.findById(event.aggregateId);
        if (isNil(view)) {
            throw new InternalServerErrorException(`Can't find listing view with id : ${event.aggregateId}`);
        }
        const blockchain = await this._blockchainRepository.findById(view.blockchainId);

        if (isNil(blockchain)) {
            throw new InternalServerErrorException(`Can't find blockchain with id : ${view.blockchainId}`);
        }

        if (blockchain.signatureType !== SignatureTypes.EVM) {
            return;
        }

        const marketplaceContracts = await this._evmContractsRepository.findByTypeAndActive(
            EvmContractType.MARKETPLACE
        );
        const found = marketplaceContracts.find((c) => c.blockchainId === blockchain.id);
        if (isNil(found)) {
            this._logger.error(`Unable to find marketplace contract with blockchain id : ${blockchain.id}`);
            throw new InternalServerErrorException(
                `Unable to find marketplace contract with blockchain id : ${blockchain.id}`
            );
        }

        const provider = new ethers.providers.JsonRpcProvider(blockchain.rpcUrl);
        const contract = this._contractFactory.createMarketplace(provider, found.deploymentAddress);
        this._logger.debug(
            `Listening for EVM listing event. Seller :  ${view.seller.address} Transaction hash: ${event.transactionHash}`
        );
        const chainResult = await contract.getListingResult(event.transactionHash, view.seller.address);

        const events = await this._eventStore.findEventsByAggregateId(event.aggregateId);
        const listing = this._listingFactory.createFromEvents(event.aggregateId, events);

        try {
            listing.activate(chainResult.blockNumber, chainResult.chainListingId);
            await listing.commit();
        } catch (error) {
            this._logger.debug(`Error during listing activation from EVM event : ${(error as Error).message}`);
        }
    }
}
